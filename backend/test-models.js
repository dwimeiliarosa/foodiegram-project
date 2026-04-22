const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("ISI_DENGAN_API_KEY_MU");

// test-models.js
async function list() {
  const key = "AIzaSyCvoEEIqmjuUNMGVvgOOFJGJjmd2wqnkLo"; 
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
list();