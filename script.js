document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const terminalCursor = document.getElementById('terminal-cursor');
    const terminalBody = document.querySelector('.terminal-body');
    const welcomeMessageElement = document.getElementById('welcome-message');
    const terminalInputLine = document.querySelector('.terminal-input-line'); // Container for cursor positioning

    // --- State Variables ---
    const initialWelcomeText = `Welcome to AceRider75's Terminal Portfolio. Type <span class="command">help</span> to see available commands.`;
    let commandHistory = [];
    let historyIndex = -1; // Initialize history index BEFORE the first command
    let currentInputValue = ''; // Stores input when navigating history
    let secretNumber = null; // For the guessing game

    // --- Focus Handling ---
    const focusInput = () => {
        // Prevent scroll restoration issues on focus
        if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        terminalInput.focus();
        // Cursor visibility/position handled by focus listener
    };
    // Initial focus on load
    window.addEventListener('load', focusInput);
    // Refocus on click/touch outside interactive elements
    document.addEventListener('mousedown', (e) => {
        // Prevent focusing input if user is selecting text or clicking a link
        if (e.target.tagName !== 'A' && window.getSelection().toString() === '' && e.target !== terminalInput) {
            focusInput();
        } else if (e.target === terminalInput) {
            // Ensure cursor updates position if clicking within the input itself
            requestAnimationFrame(updateCursorPosition);
        }
    });

    // --- Theme Definitions & Handling ---
    const themes = {
        'dark': { '--terminal-bg': '#0c0c0c', '--terminal-header-bg': '#2d2d2d', '--terminal-text': '#f0f0f0', '--terminal-prompt': '#4caf50', '--terminal-cursor': '#f0f0f0', '--terminal-highlight': '#3498db' },
        'light': { '--terminal-bg': '#f5f5f5', '--terminal-header-bg': '#e0e0e0', '--terminal-text': '#333333', '--terminal-prompt': '#1a511d', '--terminal-cursor': '#333333', '--terminal-highlight': '#1976d2' },
        'hackerman': { '--terminal-bg': '#000000', '--terminal-header-bg': '#1a1a1a', '--terminal-text': '#00ff00', '--terminal-prompt': '#00ff00', '--terminal-cursor': '#00ff00', '--terminal-highlight': '#00cc00' },
        'solarized-dark': { '--terminal-bg': '#002b36', '--terminal-header-bg': '#073642', '--terminal-text': '#839496', '--terminal-prompt': '#2aa198', '--terminal-cursor': '#93a1a1', '--terminal-highlight': '#268bd2' },
        'solarized-light': { '--terminal-bg': '#fdf6e3', '--terminal-header-bg': '#eee8d5', '--terminal-text': '#657b83', '--terminal-prompt': '#859900', '--terminal-cursor': '#586e75', '--terminal-highlight': '#268bd2' },
        'ubuntu': { '--terminal-bg': '#300a24', '--terminal-header-bg': '#2c0721', '--terminal-text': '#eeeeec', '--terminal-prompt': '#f57900', '--terminal-cursor': '#ffffff', '--terminal-highlight': '#729fcf' },
        'retro-amber': { '--terminal-bg': '#000000', '--terminal-header-bg': '#1a1a1a', '--terminal-text': '#ffb000', '--terminal-prompt': '#ffb000', '--terminal-cursor': '#ffb000', '--terminal-highlight': '#ffffff' },
        'gruvbox-dark': { '--terminal-bg': '#282828', '--terminal-header-bg': '#3c3836', '--terminal-text': '#ebdbb2', '--terminal-prompt': '#b8bb26', '--terminal-cursor': '#fe8019', '--terminal-highlight': '#458588' }
    };
    function applyTheme(themeName) {
        const theme = themes[themeName];
        if (theme) {
            for (const property in theme) { document.documentElement.style.setProperty(property, theme[property]); }
            localStorage.setItem('terminalTheme', themeName); // Persist theme choice
        }
    }
    function loadTheme() {
        const savedTheme = localStorage.getItem('terminalTheme');
        if (savedTheme && themes[savedTheme]) { applyTheme(savedTheme); }
        else { applyTheme('dark'); } // Default to dark theme
    }

    // --- Project Details Data ---
    // (Ensure all details like description, features, techStack are filled in)
    const projectDetails = {
        'hh25v3': { name: 'HH25v3 - Multimodal Chatbot', description: 'A versatile chatbot that takes input in text, audio, and image formats and provides output in text and audio, supporting multiple languages.', features: ['Multimodal Input (Text, Audio, Image)', 'Multilingual Output (Text, Audio)', 'Real-time interaction'], techStack: ['Python (Backend)', 'HTML', 'CSS', 'JavaScript (Frontend)'], github: 'https://github.com/AceRider75/hh25v3', category: 'main' },
        'hh25v2': { name: 'HH25v2 - Online Chess Multiplayer', description: 'Play chess online against other users in real-time.', features: ['Real-time Multiplayer', 'Visual Chessboard', 'Game Logic'], techStack: ['HTML', 'CSS', 'JavaScript'], github: 'https://github.com/AceRider75/hh25v2', category: 'main' },
        'paintv2.5': { name: 'Paint v2.5 - Paint App', description: 'A web application mimicking classic paint programs, built using Python.', features: ['Drawing Tools', 'Color Selection', 'Canvas Interaction'], techStack: ['Python', 'HTML Canvas', 'JavaScript', 'CSS'], github: 'https://github.com/AceRider75/paintv2.5', category: 'main' },
        'moodfood': { name: 'MoodFood', description: 'Suggests food recipes or types based on your selected mood.', features: ['Mood Selection UI', 'Suggestion Algorithm'], techStack: ['HTML', 'CSS', 'JavaScript'], github: 'https://github.com/AceRider75/moodfood', category: 'mini' },
        'moodbeats': { name: 'MoodBeats', description: 'Recommends songs or playlists tailored to your current mood.', features: ['Mood Selection', 'Song Recommendation Logic'], techStack: ['HTML', 'CSS', 'JavaScript'], github: 'https://github.com/AceRider75/moodbeats', category: 'mini' },
        'LAWSUIT': { name: 'LawSuite (April Fools)', description: 'A humorous website created as an April Fools\' Day prank.', features: ['Prank Content Delivery'], techStack: ['HTML', 'CSS', 'JavaScript'], github: 'https://github.com/AceRider75/lawsuite', category: 'mini' },
        'liar': { name: 'Liar - Convincing Lie Game', description: 'A web-based game challenging players to identify the most convincing lie among three options.', features: ['Interactive Game Loop', 'Lie Presentation', 'Scoring'], techStack: ['HTML', 'CSS', 'JavaScript'], github: 'https://github.com/AceRider75/liar', category: 'mini' },
        'ytmon': { name: 'YTMon - YouTube Creator Cards', description: 'Generates shareable Pokémon-style cards for YouTube creators using their channel handle.', features: ['Handle Input Form', 'API Communication', 'Dynamic Card Generation'], techStack: ['React (Frontend)', 'Python (Backend)', 'CSS/Tailwind CSS'], github: 'https://github.com/AceRider75/ytmon', category: 'mini' },
        'shoot': { name: 'Shoot - Asteroid Shooter', description: 'A classic asteroid shooter game playable in a mobile web browser.', features: ['Spaceship Control', 'Asteroid Generation', 'Collision Detection', 'Scoring'], techStack: ['HTML Canvas', 'JavaScript', 'CSS'], github: 'https://github.com/AceRider75/shoot', category: 'mini' }
    };
    // Add lowercase keys for case-insensitive lookup, store original keys for listing/URL generation
    const originalProjectKeys = Object.keys(projectDetails);
    originalProjectKeys.forEach(key => {
        // Ensure we don't overwrite original if key is already lowercase
        if (key !== key.toLowerCase()) {
             projectDetails[key.toLowerCase()] = projectDetails[key];
        }
    });

    // --- Command Definitions ---
    const commands = {
        'help': () => {
            // Dynamically get and format theme names
            const themeNames = Object.keys(themes);
            const formattedThemeNames = themeNames.map(t => `<span class="command">${t}</span>`).join(', ');

            return `Available commands:<br>
- <span class="command">about</span>       : Display information about AceRider75<br>
- <span class="command">skills</span>      : List technical skills<br>
- <span class="command">projects</span>    : List available projects<br>
- <span class="command">cd [proj]</span>   : Show details about a specific project<br>
- <span class="command">contact</span>     : Display contact information<br>
- <span class="command">theme [theme]</span> : Change theme. Available: ${formattedThemeNames}<br>
- <span class="command">clear</span>       : Clear the terminal output<br>
- <span class="command">game</span>        : Start a simple guessing game<br>
- <span class="command">guess [num]</span>   : Make a guess in the game<br>
- <span class="command">npm run dev</span>   : Redirect to AceRider75's GitHub profile<br>
- <span class="command">npm run [proj]</span>: Redirect to the specific project's GitHub repo<br>
`;
        },
        'about': () => {
            // Ensure placeholder location is updated
            return `
<div>
    <h2>About Me - AceRider75</h2>
    <p>Name: AceRider75</p>
    <p>Location: Jadavpur, West Bengal, India</p>
    <p>Role: Student</p>
    <br>
    <p>A developer passionate about building interesting and functional web applications. Always exploring new technologies and creating cool projects.</p>
    <p>Find more on my GitHub: <a href="https://github.com/AceRider75" target="_blank">github.com/AceRider75</a></p>
    <p>Follow me on : </p>
    <p>X: x.com/@YtFrewdd </p>
    <p>LinkedIn: https://www.linkedin.com/in/subhrajit-mukherjee-b7823331b/ </p>
</div>
`;
        },
        'skills': () => {
            return `
<div>
    <h2>Technical Skills</h2>
    <ul>
        <li>React</li> <li>HTML</li> <li>CSS</li>
        <li>JavaScript (JS)</li> <li>TypeScript (TS)</li>
        <li>Python</li> <li>C</li>
        <li>Tailwind CSS</li> <li>Next.js</li>
        <li>Git / GitHub</li> <li>Responsive Web Design</li>
    </ul>
</div>
`;
        },
        'projects': () => {
            let output = `<div><p>Type <span class="command">cd [projectname]</span> for details.</p><br>`;
            output += `<h2>Main Projects</h2><ul>`;
            originalProjectKeys.filter(key => projectDetails[key]?.category === 'main').sort().forEach(key => {
                 output += `<li><span class="command">${key}</span> - ${projectDetails[key].name}</li>`;
            });
            output += `</ul><br>`;
            output += `<hr style="border-color: var(--terminal-prompt); margin: 15px 0;">`;
            output += `<h2>Mini-Projects</h2><ul>`;
            originalProjectKeys.filter(key => projectDetails[key]?.category === 'mini').sort().forEach(key => {
                 output += `<li><span class="command">${key}</span> - ${projectDetails[key].name}</li>`;
            });
            output += `</ul></div>`;
            return output;
        },
        'cd': (args) => {
            const projectName = args[0];
            if (!projectName) return `Usage: cd [projectname]<br>Type <span class="command">projects</span>.`;
            const project = projectDetails[projectName.toLowerCase()]; // Case-insensitive lookup
            if (!project) return `Error: Project "<span class="command">${projectName}</span>" not found.<br>Type <span class="command">projects</span>.`;

            let output = `<div><h2>${project.name} (${project.category === 'main' ? 'Main Project' : 'Mini-Project'})</h2>`;
            output += `<p>${project.description}</p>`;
            if (project.features && project.features.length > 0) {
                output += `<h3>Key Features:</h3><ul>${project.features.map(f => `<li>${f}</li>`).join('')}</ul>`;
            }
            if (project.techStack && project.techStack.length > 0) {
                output += `<h3>Tech Stack:</h3><p>${project.techStack.join(', ')}</p>`;
            }
            if (project.github) {
                output += `<p>GitHub: <a href="${project.github}" target="_blank">${project.github}</a></p>`;
            }
            output += `</div>`;
            return output;
        },
        'contact': () => {
            // Ensure placeholders are updated
            return `
<div>
    <h2>Contact Information</h2>
    <p>Email: <a href="mailto:mukherjeesubhrajit75@gmail.com">mukherjeesubhrajit75@gmail.com</a></p>
    <p>GitHub: <a href="https://github.com/AceRider75" target="_blank">github.com/AceRider75</a></p>
    <p>LinkedIn: <a href="https://www.linkedin.com/in/subhrajit-mukherjee-b7823331b/" target="_blank">https://www.linkedin.com/in/subhrajit-mukherjee-b7823331b/</a></p>
    <br>
    <p>Feel free to reach out!</p>
</div>
`;
        },
        'clear': () => {
            const welcomeElement = terminalOutput.querySelector('.welcome-text');
            terminalOutput.innerHTML = '';
            if (welcomeElement) terminalOutput.appendChild(welcomeElement);
            return '';
        },
        'theme': (args) => {
            const themeName = args[0];
            // Help command now lists themes dynamically
            if (!themeName) return `Usage: theme [themename]<br>Type <span class="command">help</span> to see available themes.`;
            const normalizedThemeName = themeName.toLowerCase();
            if (themes[normalizedThemeName]) { applyTheme(normalizedThemeName); return `Theme switched to ${normalizedThemeName}.`; }
            else { return `Theme "<span class="command">${themeName}</span>" not found. Type <span class="command">help</span>.`; }
        },
        'game': () => {
            secretNumber = Math.floor(Math.random() * 10) + 1;
            return `<div><h2>Guessing Game</h2><p>I'm thinking of a number between 1 and 10. Type <span class="command">guess [number]</span>.</p></div>`;
        },
        'guess': (args) => {
            const num = args[0];
            if (secretNumber === null) return `Start the game with <span class="command">game</span> first.`;
            const guessNum = parseInt(num);
            if (isNaN(guessNum) || guessNum < 1 || guessNum > 10) return `Enter a valid number (1-10).`;
            if (guessNum === secretNumber) { const old = secretNumber; secretNumber = null; return `Correct! It was ${old}. Game over. Type <span class="command">game</span> to play again.`; }
            else if (guessNum < secretNumber) return `Too low!`; else return `Too high!`;
        },
        'npm': (args) => {
            if (args.length < 1 || args[0] !== 'run') return `Usage: npm run [dev | projectname]`;
            const target = args[1];
            if (!target) return `Usage: npm run [dev | projectname]<br>Type <span class="command">projects</span>.`;

            if (target === 'dev') { // Redirect to main profile
                setTimeout(() => { window.location.href = 'https://github.com/AceRider75'; }, 100);
                return 'Executing... Redirecting to https://github.com/AceRider75';
            } else { // Redirect to specific project repo
                const projectKeyLower = target.toLowerCase();
                const originalKey = originalProjectKeys.find(key => key.toLowerCase() === projectKeyLower); // Find original case key

                if (originalKey && projectDetails[originalKey]) { // Use original key to form URL
                    const githubUrl = `https://github.com/AceRider75/${originalKey}`;
                    setTimeout(() => { window.location.href = githubUrl; }, 100);
                    return `Executing... Redirecting to ${githubUrl}`;
                } else {
                    return `Error: Project "<span class="command">${target}</span>" not found for 'npm run'.<br>Type <span class="command">projects</span>.`;
                }
            }
        }
    };

    // --- Typing Animation ---
    function typeWriter(element, text, speed = 5, index = 0, isCommandOutput = false) {
        return new Promise(resolve => {
            let currentIndex = index;
            function type() {
                if (!element) { resolve(); return; } // Safety check
                if (currentIndex < text.length) {
                    let char = text.charAt(currentIndex);
                    if (char === '<') { // Basic HTML tag handling
                        const closingIndex = text.indexOf('>', currentIndex);
                        if (closingIndex !== -1) {
                            element.innerHTML += text.substring(currentIndex, closingIndex + 1);
                            currentIndex = closingIndex;
                        } else { element.innerHTML += char; }
                    } else { element.innerHTML += char; }
                    currentIndex++;
                    if (isCommandOutput) terminalBody.scrollTop = terminalBody.scrollHeight;
                    setTimeout(type, speed);
                } else { resolve(); } // Done
            }
            type(); // Start
        });
    }

    // --- Output Display ---
    async function displayOutput(command, output) {
        // Display command line immediately
        const commandLine = document.createElement('div');
        commandLine.className = 'response-line';
        const sanitizedCommand = command.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        commandLine.innerHTML = `<span class="terminal-prompt">visitor@portfolio:~$</span> ${sanitizedCommand}`;
        terminalOutput.appendChild(commandLine);

        // Type out the result
        if (output && output.trim() !== '') {
            const outputLine = document.createElement('div');
            outputLine.className = 'response-line';
            terminalOutput.appendChild(outputLine);
            await typeWriter(outputLine, output, 5, 0, true);
        }
        terminalBody.scrollTop = terminalBody.scrollHeight; // Ensure scroll to bottom
    }

    // --- Command Processing ---
    function processCommand(commandLine) {
        const parts = commandLine.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        if (cmd === '') return ''; // Ignore empty input

        // Add to history (ensure not duplicating last command)
        if (commandLine && commandLine !== commandHistory[commandHistory.length - 1]) {
            commandHistory.push(commandLine);
        }
        historyIndex = commandHistory.length; // Reset index to end

        // Execute command
        if (commands[cmd]) {
            try { return commands[cmd](args); } // Return result string
            catch (error) { console.error(`Error executing command: ${cmd}`, args, error); return `Error executing command: ${cmd}`; }
        } else { return `Command not found: <span class="command">${cmd}</span>. Type <span class="command">help</span>.`; }
    }

    // --- Input Event Listeners ---
    terminalInput.addEventListener('keydown', async (e) => {
        const key = e.key;

        // --- Enter Key ---
        if (key === 'Enter') {
            e.preventDefault();
            const command = terminalInput.value;
            terminalInput.value = ''; currentInputValue = ''; // Reset input and saved value
            const output = processCommand(command);
            await displayOutput(command, output);
            focusInput();
        }
        // --- History Navigation (ArrowUp) ---
        else if (key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                if (historyIndex === commandHistory.length) { // If at present input line
                    currentInputValue = terminalInput.value; // Save current input
                }
                if (historyIndex > 0) { // If there are previous commands
                    historyIndex--;
                    terminalInput.value = commandHistory[historyIndex];
                    setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0); // Cursor to end
                }
            }
        }
        // --- History Navigation (ArrowDown) ---
        else if (key === 'ArrowDown') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                if (historyIndex < commandHistory.length - 1) { // If not at the last historical command
                    historyIndex++;
                    terminalInput.value = commandHistory[historyIndex];
                    setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
                } else if (historyIndex === commandHistory.length - 1) { // If at the last historical command
                    historyIndex++; // Move index past history
                    terminalInput.value = currentInputValue; // Restore potentially saved input
                    setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
                }
            }
        }
        // --- Tab Completion ---
        else if (key === 'Tab') {
            e.preventDefault();
            const currentInput = terminalInput.value;
            const parts = currentInput.split(' ').filter(part => part !== ''); // Handle multiple spaces
            const commandPart = parts[0] ? parts[0].toLowerCase() : '';
            const lastPart = parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
            let baseInput = parts.slice(0, -1).join(' ');
            if (baseInput) baseInput += ' ';
            let currentArgList = [];
            // Determine completion source based on current input state
            const effectiveLastPart = currentInput.endsWith(' ') ? '' : lastPart; // Treat trailing space as start of new arg

            if (parts.length === 0 || (parts.length === 1 && !currentInput.endsWith(' '))) { // Completing command name
                 currentArgList = Object.keys(commands);
                 baseInput = '';
            } else if (parts.length >= 1) { // Completing arguments
                 if (commandPart === 'theme') { currentArgList = Object.keys(themes); }
                 else if (commandPart === 'cd') { currentArgList = originalProjectKeys; }
                 else if (commandPart === 'npm') {
                     if ((parts.length === 1 && currentInput.endsWith(' ')) || (parts.length === 2 && !currentInput.endsWith(' '))) {
                         // After 'npm ' or completing 'run'
                         currentArgList = ['run'];
                     } else if (parts.length === 2 && parts[1]?.toLowerCase() === 'run' && currentInput.endsWith(' ')) {
                         // After 'npm run ' -> suggest 'dev' + projects
                         currentArgList = ['dev', ...originalProjectKeys];
                     } else if (parts.length === 3 && parts[1]?.toLowerCase() === 'run' && !currentInput.endsWith(' ')) {
                          // Completing 'dev' or project name after 'npm run '
                          currentArgList = ['dev', ...originalProjectKeys];
                     }
                 }
            }

            // Find potential matches based on the relevant part
            const potentialMatches = currentArgList.filter(k => k.toLowerCase().startsWith(effectiveLastPart));

            if (potentialMatches.length === 1) { // Single match
                 terminalInput.value = baseInput + potentialMatches[0] + ' ';
                 setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
            } else if (potentialMatches.length > 1) { // Multiple matches
                 await displayOutput(currentInput, potentialMatches.join('   '));
            }
        }

        // --- Cursor Position Update Trigger ---
        // Use rAF for smoother updates after relevant key presses
        if (!['Shift', 'Control', 'Alt', 'Meta', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'Escape', 'CapsLock', 'Pause', 'ScrollLock', 'PrintScreen', 'Insert', 'Home', 'End', 'PageUp', 'PageDown', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(key)) {
            requestAnimationFrame(updateCursorPosition);
        } else if (key === 'Backspace' || key === 'Delete') {
             requestAnimationFrame(updateCursorPosition);
        }
    });

    // --- Custom Cursor Positioning Logic ---
    function updateCursorPosition() {
        if (!terminalInput || !terminalCursor || !terminalInputLine) return; // Safety check

        try {
            const inputStyle = window.getComputedStyle(terminalInput);
            const textBeforeCursor = terminalInput.value.substring(0, terminalInput.selectionStart);

            // Use a temporary span for measurement
            const tempSpan = document.createElement('span');
            // Copy comprehensive styles for accuracy
            tempSpan.style.font = inputStyle.font; tempSpan.style.fontSize = inputStyle.fontSize; tempSpan.style.fontFamily = inputStyle.fontFamily; tempSpan.style.fontWeight = inputStyle.fontWeight; tempSpan.style.fontStyle = inputStyle.fontStyle; tempSpan.style.letterSpacing = inputStyle.letterSpacing; tempSpan.style.textTransform = inputStyle.textTransform; tempSpan.style.wordSpacing = inputStyle.wordSpacing;
            tempSpan.style.padding = '0'; tempSpan.style.margin = '0'; tempSpan.style.border = 'none';
            tempSpan.style.visibility = 'hidden'; tempSpan.style.position = 'absolute'; tempSpan.style.whiteSpace = 'pre';
            tempSpan.textContent = textBeforeCursor || ''; // Measure empty string

            terminalInputLine.appendChild(tempSpan); // Append for context
            const textWidth = tempSpan.offsetWidth; // Use offsetWidth
            terminalInputLine.removeChild(tempSpan); // Clean up

            const promptElement = document.querySelector('.terminal-prompt');
            const promptWidth = promptElement ? promptElement.offsetWidth : 0;

            // Calculate position relative to the container
            const cursorLeft = promptWidth + textWidth;

            // Apply transform
            terminalCursor.style.transform = `translateX(${cursorLeft}px)`;

        } catch (error) {
            console.error("Error updating cursor position:", error);
            if(terminalCursor) terminalCursor.style.display = 'none'; // Hide on error
        }
    }

    // --- Cursor Visibility & Position Event Listeners ---
    terminalInput.addEventListener('input', () => requestAnimationFrame(updateCursorPosition));
    terminalInput.addEventListener('focus', () => {
        if(terminalCursor) terminalCursor.style.display = 'inline-block'; // Show cursor
        requestAnimationFrame(updateCursorPosition); // Update position
    });
    terminalInput.addEventListener('blur', () => {
        if(terminalCursor) terminalCursor.style.display = 'none'; // Hide cursor
    });
    terminalInput.addEventListener('click', () => requestAnimationFrame(updateCursorPosition));
    document.addEventListener('selectionchange', () => { // Track selection/caret moves
        if(document.activeElement === terminalInput) {
            requestAnimationFrame(updateCursorPosition);
        }
    });
    window.addEventListener('resize', () => requestAnimationFrame(updateCursorPosition)); // Update on resize

    // --- Initial Page Load Setup ---
    window.addEventListener('load', async () => {
        loadTheme(); // Apply theme
        if (welcomeMessageElement) { // Type welcome message
            await typeWriter(welcomeMessageElement, initialWelcomeText, 30);
        }
        // Focus triggers initial cursor visibility and position update via focus listener
        focusInput();
    });

}); // End DOMContentLoaded
