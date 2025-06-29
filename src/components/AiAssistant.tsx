import { useState } from 'react';
import { Box, Fab, Modal, Paper, Typography, TextField, IconButton, Stack, CircularProgress, Alert, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { GoogleGenerativeAI, FunctionDeclaration, Part, SchemaType } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface CustomWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
declare const window: CustomWindow;

interface Message { sender: 'user' | 'ai'; text: string; }
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) console.error("Gemini API key not found.");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const getInventoryTool: FunctionDeclaration = {
  name: "getInventoryQuantity",
  description: "Gets the quantity of a specific item from the inventory database.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      itemName: {
        type: SchemaType.STRING,
        description: "The name of the inventory item to search for."
      },
    },
    required: ["itemName"],
  },
};

const addTaskTool: FunctionDeclaration = {
  name: "scheduleTask",
  description: "Schedules a new task on the production calendar. Use this when a user wants to add a reminder, schedule an event, or plan an activity.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: "The title of the task." },
      date: { type: SchemaType.STRING, description: "The date for the task in YYYY-MM-DD format. The AI must infer this date from the user's query (e.g., 'next Friday')." },
      category: { 
        type: SchemaType.STRING, 
        description: "The category of the task. Must be one of: 'Planting', 'Harvesting', 'Maintenance', 'Logistics'."
      },
    },
    required: ["title", "date", "category"],
  },
};

const systemPrompt = `You are "AgriVance AI", a specialized assistant for the AgriVance software platform. Your purpose is to help users with topics related to agriculture, farming techniques, crop management, manufacturing processes, supply chain logistics, and inventory management.

Your answers should be helpful, concise, and formatted using Markdown.

When a user asks about inventory, use the getInventoryQuantity tool. When they ask to schedule something, use the scheduleTask tool.

IMPORTANT RULE: If a user asks a question that is NOT related to these topics (e.g., questions about history, celebrities, poetry), you MUST politely decline and state your purpose. Your main language is Filipino/tagalog but you can answer in english too when needed`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: [{ functionDeclarations: [getInventoryTool, addTaskTool] }],
  systemInstruction: systemPrompt,
});

const AiAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  const getInventoryQuantity = async (itemName: string): Promise<string> => {
    try {
      const searchName = itemName.toLowerCase();
      const inventoryCol = collection(db, "inventory");
      const q = query(inventoryCol, where("name_lowercase", "==", searchName));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return `I couldn't find any items named '${itemName}' in the inventory. Please check the spelling.`;
      }
      let totalQuantity = 0;
      let unit = '';
      querySnapshot.forEach((doc) => {
        totalQuantity += doc.data().quantity;
        unit = doc.data().unit;
      });
      return `I found a total of ${totalQuantity} ${unit} for '${itemName}'.`;
    } catch (e) {
      console.error("Firestore query error: ", e);
      return "There was an error accessing the inventory database.";
    }
  };
  
  const scheduleTask = async (title: string, date: string, category: string): Promise<string> => {
    try {
      await addDoc(collection(db, 'productionTasks'), {
        title, date, category, status: 'To Do',
      });
      return `Ok, I've scheduled "${title}" for ${date} on the calendar.`;
    } catch (e) {
      console.error("Error scheduling task: ", e);
      return "I'm sorry, I failed to schedule the task in the database.";
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Sorry, your browser doesn't support voice recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setInput(speechResult);
        setIsListening(false);
      };
      recognition.onspeechend = () => {
        recognition.stop();
        setIsListening(false);
      };
      recognition.onerror = (event: any) => {
        setError(`Voice recognition error: ${event.error}`);
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !GEMINI_API_KEY) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const chat = model.startChat();
    const currentInput = input;
    setInput('');
    setLoading(true);
    setError('');

    try {
      const result = await chat.sendMessage(currentInput);
      const call = result.response.functionCalls()?.[0];

      if (call) {
        setMessages(prev => [...prev, { sender: 'ai', text: `*Running command...*` }]);
        let toolResult: string = "An unknown error occurred with the tool.";
        const args = call.args as any;

        if (call.name === 'getInventoryQuantity' && args.itemName) {
          toolResult = await getInventoryQuantity(args.itemName);
        } else if (call.name === 'scheduleTask' && args.title && args.date && args.category) {
          toolResult = await scheduleTask(args.title, args.date, args.category);
        }

        const result2 = await chat.sendMessage([
          { functionResponse: { name: call.name, response: { result: toolResult } } } as Part,
        ]);
        const aiText = result2.response.text();
        setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
      } else {
        const aiText = result.response.text();
        setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
      }
    } catch (err: any) {
      console.error("Error in AI interaction:", err);
      setError("Sorry, there was an error connecting to the AI.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Fab color="primary" aria-label="ai-assistant" onClick={handleOpen} sx={{ position: 'fixed', bottom: 32, right: 32 }} >
        <SmartToyIcon />
      </Fab>
      <Modal open={open} onClose={handleClose}>
        <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, height: '70vh', bgcolor: 'background.paper', boxShadow: 24, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">AgriVance Assistant</Typography>
            <IconButton onClick={handleClose}><CloseIcon /></IconButton>
          </Stack>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', my: 2, px: 1 }}>
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            {messages.map((msg, index) => (
              <Box key={index} sx={{ textAlign: msg.sender === 'user' ? 'right' : 'left', my: 1 }}>
                <Paper elevation={2} sx={{ display: 'inline-block', p: '10px 14px', maxWidth: '100%', bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.200', color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary', '& p': { my: 0.5 }, '& ul, & ol': { pl: 2.5, my: 0.5 }, '& li': { mb: 0.5 }, '& h1, & h2, & h3, & h4': { mt: 1, mb: 0.5 }, }}>
                  {msg.sender === 'ai' ? (<ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>) : (msg.text)}
                </Paper>
              </Box>
            ))}
             {loading && <CircularProgress size={24} sx={{display: 'block', mx: 'auto'}} />}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField fullWidth size="small" variant="outlined" placeholder="Ask anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
            <Tooltip title={isListening ? "Stop Listening" : "Ask with Voice"}>
              <IconButton color={isListening ? "error" : "primary"} onClick={handleVoiceInput}>
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
            <IconButton color="primary" onClick={handleSend} disabled={loading || !GEMINI_API_KEY}>
              <SendIcon />
            </IconButton>
          </Stack>
        </Paper>
      </Modal>
    </>
  );
};

export default AiAssistant;