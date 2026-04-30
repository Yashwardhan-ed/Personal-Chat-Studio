const personaTabs = document.getElementById('personaTabs');
const suggestionsRoot = document.getElementById('suggestions');
const chatWindow = document.getElementById('chatWindow');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const errorMessage = document.getElementById('errorMessage');
const activePersonaLabel = document.getElementById('activePersonaLabel');
const activePersonaSubtitle = document.getElementById('activePersonaSubtitle');
const apiStatus = document.getElementById('apiStatus');
const messageTemplate = document.getElementById('messageTemplate');

const state = {
  personas: [],
  activePersonaId: 'anshuman',
  messages: [],
  isSending: false,
};

async function loadPersonas() {
  const response = await fetch('/api/personas');
  const data = await response.json();
  state.personas = data.personas || [];
  renderPersonaTabs();
  setPersona(state.activePersonaId, { resetConversation: true, silent: true });
}

function getActivePersona() {
  return state.personas.find((persona) => persona.id === state.activePersonaId);
}

function setPersona(personaId, options = {}) {
  const nextPersona = state.personas.find((persona) => persona.id === personaId);
  if (!nextPersona) return;

  state.activePersonaId = personaId;
  state.messages = [];
  errorMessage.hidden = true;
  errorMessage.textContent = '';

  activePersonaLabel.textContent = nextPersona.name;
  activePersonaSubtitle.textContent = nextPersona.subtitle;
  apiStatus.textContent = `Ready to send messages as ${nextPersona.name}.`;

  renderPersonaTabs();
  renderSuggestions();
  renderChat();

  if (!options.silent) {
    appendSystemMessage(`Conversation reset for ${nextPersona.name}.`);
  }
}

function renderPersonaTabs() {
  personaTabs.innerHTML = '';

  state.personas.forEach((persona) => {
    const button = document.createElement('button');
    button.className = `persona-tab is-${persona.accent}`;
    button.type = 'button';
    button.role = 'tab';
    button.setAttribute('aria-selected', String(persona.id === state.activePersonaId));
    button.innerHTML = `<strong>${persona.name}</strong><span>${persona.subtitle}</span>`;
    button.addEventListener('click', () => setPersona(persona.id));
    personaTabs.appendChild(button);
  });
}

function renderSuggestions() {
  const persona = getActivePersona();
  suggestionsRoot.innerHTML = '';

  if (!persona) return;

  persona.suggestions.forEach((suggestion) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = suggestion;
    chip.addEventListener('click', () => {
      messageInput.value = suggestion;
      messageInput.focus();
    });
    suggestionsRoot.appendChild(chip);
  });
}

function renderChat() {
  chatWindow.innerHTML = '';

  if (state.messages.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'message system';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = 'Start a conversation using one of the chips or type your own question below.';
    empty.appendChild(bubble);
    chatWindow.appendChild(empty);
    return;
  }

  state.messages.forEach((message) => {
    chatWindow.appendChild(createMessageNode(message.role, message.content));
  });

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createMessageNode(role, content) {
  const node = messageTemplate.content.firstElementChild.cloneNode(true);
  node.classList.add(role);
  node.querySelector('.bubble').textContent = content;
  return node;
}

function appendMessage(role, content) {
  state.messages.push({ role, content });
  chatWindow.appendChild(createMessageNode(role, content));
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendSystemMessage(content) {
  const node = document.createElement('div');
  node.className = 'message system';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = content;
  node.appendChild(bubble);
  chatWindow.appendChild(node);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping() {
  const typing = document.createElement('div');
  typing.className = 'message assistant typing';
  typing.id = 'typingIndicator';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  typing.appendChild(bubble);
  chatWindow.appendChild(typing);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTyping() {
  document.getElementById('typingIndicator')?.remove();
}

async function sendMessage() {
  const content = messageInput.value.trim();
  if (!content || state.isSending) return;

  errorMessage.hidden = true;
  state.isSending = true;
  sendButton.disabled = true;
  messageInput.disabled = true;

  appendMessage('user', content);
  messageInput.value = '';
  showTyping();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personaId: state.activePersonaId,
        messages: state.messages,
      }),
    });

    const data = await response.json();
    hideTyping();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }

    appendMessage('assistant', data.reply || 'I do not have a response yet.');
  } catch (error) {
    hideTyping();
    errorMessage.textContent = error.message || 'The request failed. Please try again.';
    errorMessage.hidden = false;
  } finally {
    state.isSending = false;
    sendButton.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 140)}px`;
});

loadPersonas().catch(() => {
  apiStatus.textContent = 'Could not load personas. Start the server and try again.';
  errorMessage.textContent = 'Failed to initialize the app.';
  errorMessage.hidden = false;
});
