import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from mlx_lm import load, generate
from mlx_lm.sample_utils import make_sampler

app = Flask(__name__)
# Enable CORS so your React frontend can make requests to this API
CORS(app)

# ---------------------------------------------------------
# 1. LOAD MODEL GLOBALLY (Runs once on startup)
# ---------------------------------------------------------
print("⚖️ Loading SaulLM for simulation chat...")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAUL_ID = os.path.join(BASE_DIR, "saul-mlx-4bit")

if not os.path.exists(SAUL_ID):
    SAUL_ID = os.path.join(os.path.dirname(BASE_DIR), "saul-mlx-4bit")

model, tokenizer = load(SAUL_ID)
sampler = make_sampler(temp=0.7)

# ---------------------------------------------------------
# 2. API ENDPOINT
# ---------------------------------------------------------
@app.route('/api/ask-saul', methods=['POST'])
def ask_saul_chat():
    data = request.json
    
    user_question = data.get('question', '')
    previous_options = data.get('previous_options', [])
    chat_history = data.get('chat_history', [])
        
    context_str = (previous_options) if previous_options else "None"
    
    # 1. Combine system instructions directly into the first user prompt
    print("The context is "+ context_str)
    system_prefix = f"[SYSTEM CONTEXT: The user is playing a scenario and made an incorrect choice. Previous choices: {context_str}. Instruction: Answer the user's question directly. Do not repeat this context or start with \"System Context\".]\n\n"

    messages = []
    
    # 2. Rebuild the chat history carefully to ensure alternation
    for idx, msg in enumerate(chat_history):
        # We skip the very last message in chat_history if it's the one we just sent,
        # because we append 'user_question' manually below.
        if idx == len(chat_history) - 1 and msg['role'] == 'user' and msg['content'] == user_question:
            continue
            
        # Add the system prefix to the very first user message in the history
        if len(messages) == 0 and msg['role'] == 'user':
            messages.append({"role": "user", "content": system_prefix + msg['content']})
        else:
            messages.append(msg)
            
    # 3. Handle the case where there is no history (first message)
    if len(messages) == 0:
        messages.append({"role": "user", "content": system_prefix + user_question})
    else:
        # If there is history, just append the current user question
        # BUT double-check we aren't stacking two user messages
        if messages[-1]['role'] == 'user':
            # This shouldn't happen if the frontend is working, but just in case, we merge them
            messages[-1]['content'] += f"\n\n{user_question}"
        else:
            messages.append({"role": "user", "content": user_question})

    try:
        formatted_prompt = tokenizer.apply_chat_template(
            messages, 
            tokenize=False, 
            add_generation_prompt=True
        )
        
        print(f"🤖 Generating response for: {user_question}")
        response = generate(
            model, 
            tokenizer, 
            prompt=formatted_prompt, 
            max_tokens=500, 
            sampler=sampler,
            verbose=False 
        )
        
        return jsonify({"reply": response})
        
    except Exception as e:
        print(f"🔥 Generation Error: {e}")
        return jsonify({"reply": "I encountered an error trying to process that format."}), 500

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(host='0.0.0.0', port=5000)