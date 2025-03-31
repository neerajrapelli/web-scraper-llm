"use client";
import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleSubmit = async () => {
    if (!inputText) return;

    setLoading(true);
    setShowResponse(false); // Hide response initially
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/process`,
        { text: inputText }
      );
      setResponseText(response.data.summary);
      setShowResponse(true); // Show response after fetching
    } catch (error) {
      setResponseText("Error fetching data.");
      setShowResponse(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-start w-full justify-center min-h-screen bg-gray-900 text-white relative">
      {/* Input Section */}
      <motion.div
        className={`flex flex-col items-center justify-center p-6 transition-transform duration-300 ease-in-out ${showResponse ? "w-[50%]" : "w-full"}`}
      >
        <motion.h1
          className="text-4xl font-bold mb-6 text-center text-blue-500 drop-shadow-custom no-select flex items-center justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src="./icon.png" className="h-8 w-8 mr-4" alt="Developer Profile Link"/>WebScrap AI
        </motion.h1>
        <motion.p
          className="text-md mb-6 text-center text-gray-500 drop-shadow-custom no-select"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Scrape websites & YouTube videos effortlessly. <br/> Extract key insights, summaries, and data in seconds.
        </motion.p>

        <motion.textarea
          className="w-full shadow-[inset_4px_4px_8px_rgba(0,0,0,0.25)] p-3 rounded-lg border max-w-lg border-gray-700 bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-300 no-select"
          placeholder="Enter text, URL, or keywords..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Submit Button */}
        <motion.button
          className="mt-4 px-6 py-2 bg-blue-600 cursor-pointer hover:bg-blue-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/50 no-select"
          onClick={handleSubmit}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "Processing..." : "Submit"}
        </motion.button>
      </motion.div>

      {/* Sidebar Response Section */}
      <motion.div
        className="fixed top-0 right-0 w-1/2 bg-gray-800 border-l-2 py-8 pl-8 border-gray-700 transition-transform duration-300 ease-in-out"
        style={{
          height: "calc(100vh - 64px)", // Sidebar stops before footer
        }}
        initial={{ opacity: 0, x: 100 }}
        animate={{
          opacity: showResponse ? 1 : 0,
          x: showResponse ? 0 : 100,
        }}
        transition={{ duration: 0.4 }}
      >
        <div className="pr-8 overflow-y-auto h-full">
        <h2 className="text-3xl mb-2 font-semibold text-blue-500">Response:</h2>
        
          <ReactMarkdown>{responseText}</ReactMarkdown>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-0 flex items-center justify-between w-full h-[64px] py-4 border-t-2 border-gray-700 text-center">
        <motion.a
          href="https://github.com/QwertyFusion"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center text-white p-2 ml-[5%] drop-shadow-custom font-bold bg-blue-600 cursor-pointer hover:bg-blue-700 rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 no-select"
          whileHover={{ scale: 1.1 }}
        >
          <img src="./github.png" className="h-5 w-5 mr-2" alt="Developer Profile Link"/>QwertyFusion
        </motion.a>
        <motion.a
          href="https://github.com/QwertyFusion/web-scrapper-python"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center text-white p-2 mr-[5%] drop-shadow-custom font-bold bg-blue-600 cursor-pointer hover:bg-blue-700 rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 no-select"
          whileHover={{ scale: 1.1 }}
        >
          <img src="./github.png" className="h-5 w-5 mr-2" alt="Github Repository Link"/>GitHub Repository
        </motion.a>
      </footer>
    </div>
  );
}
