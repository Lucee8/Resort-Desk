import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  CheckCheck, 
  Sparkles, 
  User, 
  Paperclip, 
  Smile, 
  Image as ImageIcon,
  RotateCcw,
  Bot
} from 'lucide-react';
import { WhatsAppWorkflow, WhatsAppWorkflowNode } from '../../types';

interface WhatsAppChatSimulatorProps {
  workflow: WhatsAppWorkflow;
  targetNode?: WhatsAppWorkflowNode | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SimulatedMessage {
  id: string;
  sender: 'resort' | 'guest' | 'myra_ai';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  buttons?: { label: string }[];
  isAI?: boolean;
}

export default function WhatsAppChatSimulator({
  workflow,
  targetNode,
  isOpen,
  onClose
}: WhatsAppChatSimulatorProps) {
  const [guestName, setGuestName] = useState('Anand Sharma');
  const [roomNumber, setRoomNumber] = useState('Villa 304');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize simulated messages based on the workflow
  useEffect(() => {
    const initial: SimulatedMessage[] = [];
    
    // Find action nodes in the workflow to replay
    workflow.nodes.forEach((node, idx) => {
      if (node.type === 'action' && node.config.messageText) {
        // Replace variables
        let formatted = node.config.messageText
          .replace(/\{\{GuestName\}\}/g, guestName)
          .replace(/\{\{ResortName\}\}/g, 'Majestic Serenity Resort')
          .replace(/\{\{RoomNumber\}\}/g, roomNumber)
          .replace(/\{\{CheckInDate\}\}/g, 'Aug 18, 2026')
          .replace(/\{\{BookingID\}\}/g, 'RES-8924')
          .replace(/\{\{TotalAmount\}\}/g, '$840.00');

        initial.push({
          id: `sim-${node.id}`,
          sender: 'resort',
          text: formatted,
          timestamp: idx === 0 ? '10:14 AM' : '10:16 AM',
          status: 'read',
          buttons: node.config.buttons?.map(b => ({ label: b.label }))
        });
      }
    });

    if (initial.length === 0) {
      initial.push({
        id: 'sim-default',
        sender: 'resort',
        text: `Hi ${guestName}, welcome to Majestic Serenity Resort! Your ${roomNumber} is ready for check-in. Reply anytime for concierge assistance.`,
        timestamp: '10:15 AM',
        status: 'read',
        buttons: [{ label: '📖 Breakfast & Menus' }, { label: '💆‍♀️ Book Spa' }]
      });
    }

    setMessages(initial);
  }, [workflow, guestName, roomNumber]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const guestMsg: SimulatedMessage = {
      id: `msg-${Date.now()}`,
      sender: 'guest',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    };

    setMessages(prev => [...prev, guestMsg]);
    if (!textToSend) setInputText('');

    // Trigger simulated Myra AI response
    setIsTyping(true);
    setTimeout(() => {
      let aiResponseText = '';
      const lower = text.toLowerCase();

      if (lower.includes('breakfast') || lower.includes('menu') || lower.includes('food') || lower.includes('dining')) {
        aiResponseText = `Good morning Mr. ${guestName.split(' ')[1] || guestName}! 🌺 Our farm-to-table breakfast is served daily from 6:30 AM to 10:30 AM at The Azure Pavilion. You can also view our 24/7 in-villa dining menu here: https://resortdesk.ai/menu/in-room-dining. Would you like me to reserve a poolside table for you?`;
      } else if (lower.includes('spa') || lower.includes('massage') || lower.includes('wellness')) {
        aiResponseText = `I'd love to help you unwind! 🌿 Our Lotus Sanctuary Spa has private cabana slots available today at 4:00 PM and 6:30 PM (Sunset session). Would you prefer our Signature Herbal Aromatherapy or Deep Tissue treatment?`;
      } else if (lower.includes('wifi') || lower.includes('internet') || lower.includes('password')) {
        aiResponseText = `High-speed fiber Wi-Fi is complimentary across all villas. Network name: "ResortGuest" (No password required). Speed is 250 Mbps throughout ${roomNumber}.`;
      } else if (lower.includes('housekeeping') || lower.includes('towel') || lower.includes('clean')) {
        aiResponseText = `I have dispatched our Housekeeping team to ${roomNumber} with fresh luxury Egyptian cotton towels (ETA ~5 mins). Is there anything else you need?`;
      } else if (lower.includes('checkout') || lower.includes('check out') || lower.includes('late')) {
        aiResponseText = `Standard checkout is 11:00 AM. As a valued guest, we can offer complimentary late checkout until 1:00 PM for ${roomNumber}, or extend until 4:00 PM for $60. Shall I confirm 1:00 PM for you?`;
      } else {
        aiResponseText = `Thank you for reaching out, ${guestName}! Myra AI Concierge has logged your inquiry for ${roomNumber}. Our front desk duty manager and concierge team have been notified to assist you immediately.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'myra_ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          isAI: true
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleResetChat = () => {
    setMessages([]);
    setTimeout(() => {
      setMessages([
        {
          id: 'sim-default',
          sender: 'resort',
          text: `Hi ${guestName}, your booking for Majestic Serenity Resort is confirmed for Aug 18 in ${roomNumber}. Welcome!`,
          timestamp: '10:15 AM',
          status: 'read',
          buttons: [{ label: '📖 Breakfast & Menus' }, { label: '💆‍♀️ Book Spa' }]
        }
      ]);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Controls & Info */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col justify-between shrink-0">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  WA
                </div>
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  WhatsApp Simulator
                </h3>
              </div>
              <button
                onClick={handleResetChat}
                title="Reset simulation"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Experience the guest journey in real-time. Test triggers, templates, button clicks, and Myra AI automated replies.
            </p>

            {/* Test Guest Profile Selection */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Simulated Guest Profile
              </span>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Assigned Room/Villa</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Test Prompts */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Guest Inquiries
              </span>
              <button
                onClick={() => handleSendMessage('What time is breakfast served tomorrow?')}
                className="text-left text-xs bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 transition-colors cursor-pointer"
              >
                🍳 "What time is breakfast?"
              </button>
              <button
                onClick={() => handleSendMessage('Can we book a sunset couples spa session?')}
                className="text-left text-xs bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 transition-colors cursor-pointer"
              >
                💆‍♀️ "Can we book a sunset spa session?"
              </button>
              <button
                onClick={() => handleSendMessage('What is the Wi-Fi network and password?')}
                className="text-left text-xs bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 transition-colors cursor-pointer"
              >
                📶 "What is the Wi-Fi password?"
              </button>
              <button
                onClick={() => handleSendMessage('Can we request late checkout for tomorrow?')}
                className="text-left text-xs bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 transition-colors cursor-pointer"
              >
                ⏰ "Can we request late checkout?"
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer mt-4"
          >
            Close Simulator
          </button>
        </div>

        {/* Right Side: Realistic Phone Container */}
        <div className="flex-1 bg-[#efeae2] flex flex-col justify-between overflow-hidden relative">
          {/* Phone Top WhatsApp Header */}
          <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-800 border-2 border-white/30 flex items-center justify-center font-bold text-sm text-white shadow-xs">
                M
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white">
                    Majestic Serenity Resort
                  </h4>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 flex items-center justify-center text-[9px] text-teal-950 font-bold">
                    ✓
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-200" />
                  <span>Myra AI Concierge (Official Business)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/90">
              <Video className="w-4 h-4 cursor-pointer hover:text-white" />
              <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Chat Messages Feed with authentic WhatsApp wallpaper pattern */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {/* End-to-End Encryption Notice */}
            <div className="bg-[#ffeecd] border border-[#f3d99e] rounded-lg px-3 py-1.5 text-center text-[10px] text-amber-900 max-w-sm mx-auto shadow-2xs">
              🔒 Messages and calls are end-to-end encrypted. Official Verified Business Account.
            </div>

            {messages.map((msg) => {
              const isOutbound = msg.sender === 'resort' || msg.sender === 'myra_ai';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOutbound ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl p-3 shadow-xs text-xs relative ${
                      isOutbound 
                        ? 'bg-white text-slate-800 rounded-tl-xs' 
                        : 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs'
                    }`}
                  >
                    {/* Myra AI Tag if AI generated */}
                    {msg.isAI && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 mb-1">
                        <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                        <span>Myra AI Automated Response</span>
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {/* Quick Reply Button Options if any */}
                    {msg.buttons && msg.buttons.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                        {msg.buttons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(btn.label)}
                            className="w-full text-center py-1.5 px-3 bg-slate-50 hover:bg-teal-50 text-teal-800 font-semibold rounded-lg text-xs border border-slate-200 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp & Status checks */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {isOutbound && (
                        <CheckCheck className="w-3 h-3 text-blue-500 inline" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 max-w-[140px] shadow-xs text-xs text-slate-500 rounded-tl-xs">
                <Sparkles className="w-3 h-3 text-purple-600 animate-spin" />
                <span className="font-medium animate-pulse">Myra is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-slate-300/80 shrink-0">
            <Smile className="w-5 h-5 text-slate-500 cursor-pointer hover:text-slate-700" />
            <Paperclip className="w-5 h-5 text-slate-500 cursor-pointer hover:text-slate-700" />
            <input
              type="text"
              placeholder="Type a message as guest..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700 shadow-2xs"
            />
            <button
              onClick={() => handleSendMessage()}
              className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
