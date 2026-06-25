/* ════════════════════════════════════════════════════════════
   CHAT.JS — Logique du chatbot client simulé
   ════════════════════════════════════════════════════════════

   Ce fichier fait fonctionner le widget de chat visible par les
   CLIENTS (pas les admins). C'est une simulation : aucune vraie
   IA n'est appelée, on répond simplement selon des mots-clés
   trouvés dans le message du visiteur.

   Utilisé par : chatbot-demo.html
   ──────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────
   1. BASE DE RÉPONSES
   ────────────────────────────────────────────────────────────
   Chaque entrée a une liste de mots-clés à détecter dans le
   message du visiteur, et la réponse à renvoyer si trouvés.
   L'ordre compte : la première règle qui correspond est utilisée.
   ──────────────────────────────────────────────────────────── */

const BOT_RULES = [
  {
    keywords: ["horaire", "ouvert", "ferme", "heure"],
    reply:
      "Nous sommes ouverts tous les jours de 9h à 22h, sauf le dimanche où nous fermons à 18h. 😊",
  },
  {
    keywords: ["réserv", "table", "booking"],
    reply:
      "Bien sûr ! Pour combien de personnes souhaitez-vous réserver, et à quelle date ?",
  },
  {
    keywords: ["prix", "tarif", "coûte", "combien"],
    reply:
      "Nos tarifs varient selon le menu choisi. Souhaitez-vous que je vous envoie notre carte complète ?",
  },
  {
    keywords: ["livraison", "livrer", "livre"],
    reply:
      "Oui, nous livrons dans un rayon de 5 km, tous les jours jusqu'à 23h. Quelle est votre adresse ?",
  },
  {
    keywords: ["annul", "modifier", "changer"],
    reply:
      "Aucun souci ! Donnez-moi votre numéro de réservation ou le nom utilisé lors de la réservation.",
  },
  {
    keywords: ["stock", "disponible", "dispo"],
    reply:
      "Je vérifie la disponibilité tout de suite. Quel produit recherchez-vous exactement ?",
  },
  {
    keywords: ["merci", "parfait", "super", "top"],
    reply: "Avec plaisir 😊 N'hésitez pas si vous avez d'autres questions !",
  },
  {
    keywords: ["bonjour", "salut", "hello", "bonsoir"],
    reply: "Bonjour 👋 Comment puis-je vous aider aujourd'hui ?",
  },
  {
    keywords: ["agent", "humain", "personne", "parler à quelqu"],
    reply:
      "Je transfère votre demande à un membre de notre équipe, un instant s'il vous plaît…",
    escalate: true, // déclenche un badge "transfert vers agent" dans l'UI
  },
];

// Réponse par défaut si aucun mot-clé ne correspond
const BOT_FALLBACK =
  "Je ne suis pas certain de comprendre 🤔 Pouvez-vous reformuler, ou souhaitez-vous parler à un agent ?";

/* ────────────────────────────────────────────────────────────
   2. MOTEUR DE RÉPONSE
   ────────────────────────────────────────────────────────────
   Cherche la première règle dont un mot-clé apparaît dans le
   message (insensible à la casse et aux accents simples).
   ──────────────────────────────────────────────────────────── */

function getBotReply(userMessage) {
  const normalized = userMessage.toLowerCase();

  for (const rule of BOT_RULES) {
    const matched = rule.keywords.some((keyword) =>
      normalized.includes(keyword),
    );
    if (matched) {
      return { text: rule.reply, escalate: !!rule.escalate };
    }
  }

  return { text: BOT_FALLBACK, escalate: false };
}

/* ────────────────────────────────────────────────────────────
   3. GESTION DE LA FENÊTRE DE CHAT (ouverture / fermeture)
   ────────────────────────────────────────────────────────────
   Structure HTML attendue dans chatbot-demo.html :
     #chat-bubble   → bouton flottant pour ouvrir le chat
     #chat-window   → fenêtre de conversation
     #chat-messages → conteneur des bulles de messages
     #chat-input    → champ de saisie du visiteur
   ──────────────────────────────────────────────────────────── */

function openChatWidget() {
  document.getElementById("chat-window").classList.remove("hidden");
  document.getElementById("chat-bubble").classList.add("hidden");
  document.getElementById("chat-input").focus();
}

function closeChatWidget() {
  document.getElementById("chat-window").classList.add("hidden");
  document.getElementById("chat-bubble").classList.remove("hidden");
}

/* ────────────────────────────────────────────────────────────
   4. AFFICHAGE D'UNE BULLE DE MESSAGE
   ────────────────────────────────────────────────────────────
   sender = 'user' ou 'bot'
   ──────────────────────────────────────────────────────────── */

function appendMessage(sender, text) {
  const container = document.getElementById("chat-messages");
  const wrapper = document.createElement("div");

  if (sender === "user") {
    wrapper.className = "flex justify-end";
    wrapper.innerHTML = `
      <div class="max-w-[75%] bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-md">
        ${escapeHtml(text)}
      </div>`;
  } else {
    wrapper.className = "flex justify-start items-end gap-2";
    wrapper.innerHTML = `
      <span class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
        <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      </span>
      <div class="max-w-[75%] bg-slate-100 text-slate-700 text-sm px-4 py-2.5 rounded-2xl rounded-bl-md">
        ${escapeHtml(text)}
      </div>`;
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

/* Échappe les caractères HTML pour éviter toute injection
   si le visiteur tape <script> ou autre dans le champ */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ────────────────────────────────────────────────────────────
   5. INDICATEUR "EN TRAIN D'ÉCRIRE…"
   ──────────────────────────────────────────────────────────── */

function showTypingIndicator() {
  const container = document.getElementById("chat-messages");
  const wrapper = document.createElement("div");
  wrapper.id = "typing-indicator";
  wrapper.className = "flex justify-start items-end gap-2";
  wrapper.innerHTML = `
    <span class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
      <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
    </span>
    <div class="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
      <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
    </div>`;
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

/* ────────────────────────────────────────────────────────────
   6. ENVOI D'UN MESSAGE (appelé par le formulaire du widget)
   ──────────────────────────────────────────────────────────── */

function sendChatMessage(event) {
  event.preventDefault();

  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;

  // Affiche le message du visiteur
  appendMessage("user", text);
  input.value = "";

  // Simule un temps de "réflexion" de l'IA avant de répondre
  showTypingIndicator();

  setTimeout(
    () => {
      hideTypingIndicator();
      const reply = getBotReply(text);
      appendMessage("bot", reply.text);

      // Si la règle déclenche une escalade vers un agent humain
      if (reply.escalate) {
        showEscalateBadge();
      }
    },
    900 + Math.random() * 600,
  ); // délai variable pour paraître naturel
}

/* Affiche un petit badge "transféré à un agent" dans l'en-tête du chat */
function showEscalateBadge() {
  const badge = document.getElementById("chat-status-badge");
  if (!badge) return;
  badge.textContent = "🙋 Agent en cours";
  badge.classList.remove("bg-emerald-50", "text-emerald-600");
  badge.classList.add("bg-amber-50", "text-amber-600");
}

/* ────────────────────────────────────────────────────────────
   7. SUGGESTIONS RAPIDES (boutons cliquables pré-remplis)
   ──────────────────────────────────────────────────────────── */

function sendSuggestion(text) {
  document.getElementById("chat-input").value = text;
  sendChatMessage({ preventDefault: () => {} });
}
