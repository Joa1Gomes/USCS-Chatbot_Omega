function toggleChat() {
    const popup = document.getElementById('chatPopup');
    popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      const message = event.target.value;
      if (message.trim()) {
        addMessage(message);
        event.target.value = '';
      }
    }
  }

  function addMessage(message) {
    const chatBody = document.getElementById('chatBody');
    const messageDiv = document.createElement('div');
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.padding = '8px';
    messageDiv.style.backgroundColor = '#f0f0f0';
    messageDiv.style.borderRadius = '5px';
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }