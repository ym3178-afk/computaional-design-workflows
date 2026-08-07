'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    apiKey: 'AIzaSyCKQPh5FW1jYVwq9_qVz5vEbUt0_w7hsgA',
    authDomain: 'columbia-study-poll.firebaseapp.com',
    databaseURL: 'https://columbia-study-poll-default-rtdb.firebaseio.com',
    projectId: 'columbia-study-poll',
    storageBucket: 'columbia-study-poll.firebasestorage.app',
    messagingSenderId: '895025746979',
    appId: '1:895025746979:web:8ccfc77de1c66d9b874d96',
    measurementId: 'G-27HKC08L46'
  };

  const options = {
    butler: 'Butler Library',
    avery: 'Avery Library',
    cafe: 'Campus Café',
    dorm: 'Dorm / Home',
    outdoor: 'Outdoor Spaces',
    studio: 'Studio / Lab'
  };

  const storageKey = 'columbiaStudyPollChoice';
  const keys = Object.keys(options);
  const voteButtons = [...document.querySelectorAll('.vote-option')];
  const totalVotesElement = document.getElementById('total-votes');
  const leadingResultElement = document.getElementById('leading-result');
  const participationStatus = document.getElementById('participation-status');
  const connectionStatus = document.getElementById('connection-status');
  const pollMessage = document.getElementById('poll-message');
  const changeVoteButton = document.getElementById('change-vote');

  const ui = Object.fromEntries(keys.map((key) => [key, {
    count: document.getElementById(`${key}-count`),
    percent: document.getElementById(`${key}-percent`),
    bar: document.getElementById(`${key}-bar`),
    button: document.querySelector(`[data-option="${key}"]`)
  }]));

  let database;
  let connected = false;
  let submitting = false;
  let currentCounts = Object.fromEntries(keys.map((key) => [key, 0]));
  let savedChoice = getSavedChoice();
  let changingVote = false;

  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    setUpRealtimeListener();
    setUpConnectionMonitor();
    setUpVoting();
    renderParticipationState();
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    setConnectionState('error', 'Configuration error');
    setMessage('Firebase could not be initialized. Check the configuration and browser console.');
    refreshButtonState();
  }

  function setUpRealtimeListener() {
    database.ref('studyPoll').on('value', (snapshot) => {
      const data = snapshot.val() || {};
      keys.forEach((key) => {
        const nextCount = Math.max(0, Number(data[key]) || 0);
        if (currentCounts[key] !== nextCount) animateCount(ui[key].count);
        currentCounts[key] = nextCount;
      });
      renderResults();
    }, (error) => {
      console.error('Firebase read failed:', error);
      setMessage('Results could not be loaded. Check your Realtime Database rules.');
    });
  }

  function setUpVoting() {
    voteButtons.forEach((button) => {
      button.addEventListener('click', () => submitChoice(button.dataset.option));
    });

    changeVoteButton.addEventListener('click', () => {
      changingVote = true;
      setMessage('Choose a different space. Your previous response will be moved, not duplicated.');
      renderParticipationState();
    });
  }

  async function submitChoice(nextChoice) {
    if (!options[nextChoice] || !database || !connected || submitting) return;
    if (savedChoice && !changingVote) return;
    if (savedChoice === nextChoice) {
      changingVote = false;
      setMessage(`${options[nextChoice]} is already your recorded response.`);
      renderParticipationState();
      return;
    }

    submitting = true;
    refreshButtonState();
    const previousChoice = savedChoice;
    setMessage(previousChoice
      ? `Moving your response to ${options[nextChoice]}…`
      : `Recording your response for ${options[nextChoice]}…`);

    try {
      const result = await database.ref('studyPoll').transaction((poll) => {
        const nextPoll = poll && typeof poll === 'object' ? { ...poll } : {};
        keys.forEach((key) => { nextPoll[key] = Math.max(0, Number(nextPoll[key]) || 0); });
        if (previousChoice && options[previousChoice]) {
          nextPoll[previousChoice] = Math.max(0, nextPoll[previousChoice] - 1);
        }
        nextPoll[nextChoice] += 1;
        return nextPoll;
      });

      if (!result.committed) throw new Error('Vote transaction was not committed.');
      savedChoice = nextChoice;
      localStorage.setItem(storageKey, nextChoice);
      changingVote = false;
      setMessage(`Thank you — ${options[nextChoice]} is now your recorded response.`);
      ui[nextChoice].button.classList.add('just-selected');
      window.setTimeout(() => ui[nextChoice].button.classList.remove('just-selected'), 700);
    } catch (error) {
      console.error('Vote transaction failed:', error);
      setMessage('Your response could not be recorded. Please try again.');
    } finally {
      submitting = false;
      renderParticipationState();
    }
  }

  function setUpConnectionMonitor() {
    database.ref('.info/connected').on('value', (snapshot) => {
      connected = snapshot.val() === true;
      setConnectionState(connected ? 'connected' : 'disconnected', connected ? 'Firebase connected' : 'Offline');
      if (!connected) setMessage('You are offline. Live results will return when the connection is restored.');
      refreshButtonState();
    });
  }

  function renderResults() {
    const total = keys.reduce((sum, key) => sum + currentCounts[key], 0);
    totalVotesElement.textContent = total.toLocaleString('en-US');

    keys.forEach((key) => {
      const count = currentCounts[key];
      const share = total ? (count / total) * 100 : 0;
      ui[key].count.textContent = count.toLocaleString('en-US');
      ui[key].percent.textContent = `${Math.round(share)}%`;
      ui[key].bar.style.width = `${share}%`;
      ui[key].button.setAttribute('aria-label', `${options[key]}: ${count} votes, ${Math.round(share)} percent`);
    });

    if (!total) {
      leadingResultElement.innerHTML = '<strong>—</strong><span>Leading response</span>';
      return;
    }

    const highest = Math.max(...keys.map((key) => currentCounts[key]));
    const leaders = keys.filter((key) => currentCounts[key] === highest).map((key) => options[key]);
    const leaderLabel = leaders.length === 1 ? leaders[0] : `${leaders.length}-way tie`;
    leadingResultElement.innerHTML = `<strong>${escapeHtml(leaderLabel)}</strong><span>Leading response</span>`;
  }

  function renderParticipationState() {
    voteButtons.forEach((button) => {
      const selected = savedChoice === button.dataset.option;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    if (!savedChoice) {
      participationStatus.innerHTML = '<strong>Open</strong><span>Your response</span>';
      changeVoteButton.hidden = true;
    } else if (changingVote) {
      participationStatus.innerHTML = '<strong>Editing</strong><span>Your response</span>';
      changeVoteButton.hidden = true;
    } else {
      participationStatus.innerHTML = `<strong>${escapeHtml(options[savedChoice])}</strong><span>Your response</span>`;
      changeVoteButton.hidden = false;
    }
    refreshButtonState();
  }

  function refreshButtonState() {
    voteButtons.forEach((button) => {
      button.disabled = !connected || submitting || Boolean(savedChoice && !changingVote);
    });
  }

  function getSavedChoice() {
    try {
      const value = localStorage.getItem(storageKey);
      return options[value] ? value : null;
    } catch (error) {
      console.warn('Local storage is unavailable:', error);
      return null;
    }
  }

  function animateCount(element) {
    element.classList.remove('updated');
    void element.offsetWidth;
    element.classList.add('updated');
  }

  function setConnectionState(state, label) {
    connectionStatus.className = `connection-status is-${state}`;
    connectionStatus.querySelector('span:last-child').textContent = label;
  }

  function setMessage(message) {
    pollMessage.textContent = message;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
});
