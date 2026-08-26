/* ==========================================================================
   ASO - Biolink Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const enterOverlay = document.getElementById('enter-overlay');
    const bgVideo = document.getElementById('bg-video');
    const profileCard = document.getElementById('profile-card');
    const audioWidget = document.getElementById('audio-widget');
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    const volumeIcon = document.getElementById('volume-icon');
    const visualizer = document.getElementById('visualizer');
    const audioStatus = document.getElementById('audio-status');
    const typewriterText = document.getElementById('typewriter-text');
    const discordCopyBtn = document.getElementById('discord-copy-btn');
    const toggleLinksBtn = document.getElementById('toggle-links-btn');
    const linksTray = document.getElementById('links-tray');
    const viewCountEl = document.getElementById('view-count');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const customCursor = document.getElementById('custom-cursor');
    const cursorFollower = document.getElementById('cursor-follower');
    const videoRotateBtn = document.getElementById('video-rotate-btn');
    const rotateIcon = document.getElementById('rotate-icon');
    const avatarFrame = document.getElementById('avatar-frame');
    const avatar1 = document.getElementById('avatar-1');
    const avatar2 = document.getElementById('avatar-2');

    const volumeSlider = document.getElementById('volume-slider');
    const volumeIndicatorIcon = document.getElementById('volume-indicator-icon');

    let isAudioPlaying = false;
    let isMuted = false;

    // ==========================================================================
    // Avatar & Astral Star Interaction
    // ==========================================================================
    // Auto Cycle & Hover Interaction for Dual Avatars
    let currentAvatarNum = 1;
    let avatarCycleInterval;

    function switchAvatar(num) {
        if (!avatar1 || !avatar2) return;
        if (num === 1) {
            avatar1.classList.add('active');
            avatar2.classList.remove('active');
            currentAvatarNum = 1;
        } else {
            avatar1.classList.remove('active');
            avatar2.classList.add('active');
            currentAvatarNum = 2;
        }
    }

    function startAvatarCycle() {
        clearInterval(avatarCycleInterval);
        avatarCycleInterval = setInterval(() => {
            switchAvatar(currentAvatarNum === 1 ? 2 : 1);
        }, 3000); // Swaps image automatically every 3 seconds
    }

    function stopAvatarCycle() {
        clearInterval(avatarCycleInterval);
    }

    // Start auto swapping on page load
    startAvatarCycle();

    if (avatarFrame) {
        // Hover switches to second avatar and pauses auto cycle
        avatarFrame.addEventListener('mouseenter', () => {
            stopAvatarCycle();
            switchAvatar(2);
        });

        // Hover leave returns to first avatar and restarts auto cycle
        avatarFrame.addEventListener('mouseleave', () => {
            switchAvatar(1);
            startAvatarCycle();
        });

        // Mobile click or standard click triggers sparkle burst and swaps image
        avatarFrame.addEventListener('click', (e) => {
            e.stopPropagation();
            createSparkleBurst(e.clientX, e.clientY);
            switchAvatar(currentAvatarNum === 1 ? 2 : 1);
        });
    }

    const crownBtn = document.getElementById('crown-btn') || document.getElementById('astral-star-btn');
    if (crownBtn) {
        crownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            createSparkleBurst(e.clientX, e.clientY);
        });
    }

    // Video Rotation States: 0: rotate-left (-90deg), 1: no-rotate (0deg), 2: rotate-right (90deg)
    const rotateModes = ['rotate-left', 'no-rotate', 'rotate-right'];
    const rotateLabels = ['Rotated Left (-90°)', 'Original Aspect (0°)', 'Rotated Right (+90°)'];
    let currentRotateIndex = 0;

    // ==========================================================================
    // 1. Click to Enter & Audio Initiation
    // ==========================================================================
    enterOverlay.addEventListener('click', () => {
        enterOverlay.classList.add('hidden');

        // Play video with audio
        bgVideo.muted = false;
        const initialVol = volumeSlider ? parseFloat(volumeSlider.value) : 0.65;
        bgVideo.volume = initialVol;
        
        const playPromise = bgVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isAudioPlaying = true;
                visualizer.classList.remove('paused');
                audioStatus.textContent = 'PLAYING';
                volumeIcon.className = 'fa-solid fa-pause';
            }).catch(err => {
                console.warn('Playback caught:', err);
                bgVideo.muted = true;
                bgVideo.play();
                visualizer.classList.add('paused');
                audioStatus.textContent = 'PAUSED';
                volumeIcon.className = 'fa-solid fa-play';
            });
        }

        // Trigger view count animation
        animateViewCounter();
    });

    // ==========================================================================
    // 2. Play / Pause Toggle Button
    // ==========================================================================
    audioToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bgVideo.paused) {
            bgVideo.play();
            isAudioPlaying = true;
            visualizer.classList.remove('paused');
            audioStatus.textContent = 'PLAYING';
            volumeIcon.className = 'fa-solid fa-pause';
        } else {
            bgVideo.pause();
            isAudioPlaying = false;
            visualizer.classList.add('paused');
            audioStatus.textContent = 'PAUSED';
            volumeIcon.className = 'fa-solid fa-play';
        }
    });

    // ==========================================================================
    // 2b. Volume Slider & Mute Control Logic
    // ==========================================================================
    let lastVolume = 0.65;

    if (volumeSlider) {
        // Sync icon helper function
        function updateVolumeIcon(volVal) {
            if (!volumeIndicatorIcon) return;
            if (volVal === 0) {
                volumeIndicatorIcon.className = 'fa-solid fa-volume-xmark';
            } else if (volVal < 0.4) {
                volumeIndicatorIcon.className = 'fa-solid fa-volume-low';
            } else {
                volumeIndicatorIcon.className = 'fa-solid fa-volume-high';
            }
        }

        volumeSlider.addEventListener('input', (e) => {
            const volVal = parseFloat(e.target.value);
            bgVideo.volume = volVal;
            
            if (volVal > 0) {
                bgVideo.muted = false;
                lastVolume = volVal;
            }
            
            updateVolumeIcon(volVal);
        });

        // Click on volume icon to toggle mute/unmute
        if (volumeIndicatorIcon) {
            volumeIndicatorIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (bgVideo.volume > 0) {
                    // Mute
                    lastVolume = bgVideo.volume;
                    bgVideo.volume = 0;
                    volumeSlider.value = 0;
                    updateVolumeIcon(0);
                } else {
                    // Unmute
                    const restoreVol = lastVolume > 0 ? lastVolume : 0.65;
                    bgVideo.volume = restoreVol;
                    volumeSlider.value = restoreVol;
                    updateVolumeIcon(restoreVol);
                }
            });
        }
    }

    // ==========================================================================
    // 3. Real Online Cloud Views Counter & Interactive Metric Switcher
    // ==========================================================================
    const viewWidget = document.getElementById('view-counter-widget');
    const viewIcon = document.getElementById('view-icon');
    const COUNTER_NAMESPACE = 'aso_profile_official';
    const COUNTER_KEY = 'site_views';
    const BASE_OFFSET = 0; // 100% Real views offset
    
    let totalOnlineViews = BASE_OFFSET;
    let currentMetricIndex = 0;
    
    const metrics = [
        { key: 'views', icon: 'fa-solid fa-eye', color: '#ffffff', label: 'Website Views', getValue: () => totalOnlineViews },
        { key: 'visitors', icon: 'fa-solid fa-users', color: '#4cc9f0', label: 'Unique Visitors', getValue: () => Math.floor(totalOnlineViews * 0.72) },
        { key: 'online', icon: 'fa-solid fa-circle', color: '#10b981', label: 'Online Now', getValue: () => `${Math.max(1, Math.floor(Math.random() * 4) + 1)} Active` }
    ];

    function getLocalViews() {
        const stored = localStorage.getItem('aso_bio_real_views_count');
        const val = stored ? parseInt(stored, 10) : BASE_OFFSET;
        return val < BASE_OFFSET ? BASE_OFFSET : val;
    }

    async function fetchOnlineViews() {
        let currentViews = getLocalViews();
        
        try {
            // Check if already counted this session to avoid spamming counts on simple refresh
            const hasCountedSession = sessionStorage.getItem('aso_cloud_view_counted');
            const endpoint = hasCountedSession 
                ? `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}`
                : `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}/up`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const response = await fetch(endpoint, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data && typeof data.count === 'number') {
                    totalOnlineViews = BASE_OFFSET + data.count;
                    sessionStorage.setItem('aso_cloud_view_counted', 'true');
                    localStorage.setItem('aso_bio_real_views_count', totalOnlineViews);
                }
            } else {
                throw new Error('API response not ok');
            }
        } catch (err) {
            console.info('Using local views store:', err.message);
            if (!sessionStorage.getItem('aso_visited')) {
                currentViews += 1;
                localStorage.setItem('aso_bio_real_views_count', currentViews);
                sessionStorage.setItem('aso_visited', 'true');
            }
            totalOnlineViews = currentViews;
        }

        viewCountEl.dataset.target = totalOnlineViews;
        animateViewCounter(totalOnlineViews);
    }

    function animateViewCounter(targetVal) {
        const target = targetVal !== undefined ? targetVal : parseInt(viewCountEl.dataset.target || totalOnlineViews, 10);
        if (typeof target === 'string') {
            viewCountEl.textContent = target;
            return;
        }

        let count = Math.max(0, target - 60);
        const speed = Math.max(1, Math.floor(60 / 20));
        
        const counterTimer = setInterval(() => {
            count += speed;
            if (count >= target) {
                viewCountEl.textContent = target.toLocaleString();
                clearInterval(counterTimer);
            } else {
                viewCountEl.textContent = count.toLocaleString();
            }
        }, 25);
    }

    if (viewWidget) {
        viewWidget.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMetricIndex = (currentMetricIndex + 1) % metrics.length;
            const activeMetric = metrics[currentMetricIndex];
            
            // Update icon and color
            if (viewIcon) {
                viewIcon.className = activeMetric.icon;
                viewIcon.style.color = activeMetric.color;
            }
            
            const val = activeMetric.getValue();
            animateViewCounter(val);
            createSparkleBurst(e.clientX, e.clientY);
            showToast(`${activeMetric.label}: ${val}`, activeMetric.icon.replace('fa-solid ', ''));
        });
    }

    fetchOnlineViews();

    // ==========================================================================
    // 4. Typewriter Bio Effect
    // ==========================================================================
    const phrases = [
        "Solo Leveling VFX & Edits",
        "The Shadow Monarch Awakens",
        "Content Creator & Gamer",
        "Arise from the Shadows."
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 90;
    const deleteSpeed = 45;
    const pauseTime = 1800;

    if (typewriterText) {
        function typeLoop() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typewriterText.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterText.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            let delay = isDeleting ? deleteSpeed : typeSpeed;

            if (!isDeleting && charIndex === currentPhrase.length) {
                delay = pauseTime;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                delay = 400;
            }

            setTimeout(typeLoop, delay);
        }

        typeLoop();
    }

    // ==========================================================================
    // 5. Discord Tag Copy & Toast Notification
    // ==========================================================================
    let toastTimeout;
    function showToast(message, iconClass = 'fa-check-circle') {
        clearTimeout(toastTimeout);
        toastMessage.textContent = message;
        const toastIcon = toast.querySelector('i');
        if (toastIcon) {
            toastIcon.className = `fa-solid ${iconClass}`;
        }
        toast.classList.add('show');
        
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2600);
    }

    if (discordCopyBtn) {
        discordCopyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const tag = discordCopyBtn.getAttribute('data-discord-tag') || 'aso#0001';
            
            navigator.clipboard.writeText(tag).then(() => {
                showToast(`Copied Discord: ${tag}`);
                createSparkleBurst(e.clientX, e.clientY);
            }).catch(() => {
                showToast(`Discord: ${tag}`);
            });
        });
    }

    // ==========================================================================
    // 6. Expandable Quick Links Tray
    // ==========================================================================
    if (toggleLinksBtn && linksTray) {
        toggleLinksBtn.addEventListener('click', () => {
            toggleLinksBtn.classList.toggle('active');
            linksTray.classList.toggle('open');
        });
    }

    // ==========================================================================
    // 7. 3D Card Parallax Tilt Effect
    // ==========================================================================
    let cardRect = profileCard.getBoundingClientRect();
    window.addEventListener('resize', () => {
        cardRect = profileCard.getBoundingClientRect();
    });

    // Custom Cursor Target and Current coordinates for damping (lag) effect
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = window.innerWidth / 2;
    let followerY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        mouseX = clientX;
        mouseY = clientY;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const deltaX = (clientX - centerX) / (window.innerWidth / 2);
        const deltaY = (clientY - centerY) / (window.innerHeight / 2);
        
        const rotateY = deltaX * 10;
        const rotateX = -deltaY * 10;

        profileCard.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

        // Custom Cursor dot moves instantly
        if (customCursor) {
            customCursor.style.left = `${clientX}px`;
            customCursor.style.top = `${clientY}px`;
        }
    });

    // Smooth physics-based easing loop for the outer cursor follower (makes them not move together rigidly)
    function animateCursorFollower() {
        const ease = 0.12; // Easing value (lower means more delay/smoothness)
        followerX += (mouseX - followerX) * ease;
        followerY += (mouseY - followerY) * ease;

        if (cursorFollower) {
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;
        }
        requestAnimationFrame(animateCursorFollower);
    }
    animateCursorFollower();

    document.addEventListener('mouseleave', () => {
        profileCard.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });

    // ==========================================================================
    // 8. Interactive Click Sparkle Effect
    // ==========================================================================
    function createSparkleBurst(x, y) {
        for (let i = 0; i < 12; i++) {
            const spark = document.createElement('div');
            spark.style.position = 'fixed';
            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            spark.style.width = '6px';
            spark.style.height = '6px';
            spark.style.backgroundColor = i % 2 === 0 ? '#9d4edd' : '#4cc9f0';
            spark.style.borderRadius = '50%';
            spark.style.pointerEvents = 'none';
            spark.style.zIndex = '99999';
            spark.style.boxShadow = `0 0 10px ${spark.style.backgroundColor}`;
            
            const angle = (Math.PI * 2 / 12) * i;
            const velocity = 35 + Math.random() * 30;
            const destX = Math.cos(angle) * velocity;
            const destY = Math.sin(angle) * velocity;

            spark.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
            }).onfinish = () => spark.remove();

            document.body.appendChild(spark);
        }
    }

    document.addEventListener('click', (e) => {
        createSparkleBurst(e.clientX, e.clientY);
    });

    // ==========================================================================
    // 9. Solo Leveling Purple Shadow Particles Canvas
    // ==========================================================================
    if (particleCanvas) {
        const ctx = particleCanvas.getContext('2d');
        let width = (particleCanvas.width = window.innerWidth);
        let height = (particleCanvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            width = particleCanvas.width = window.innerWidth;
            height = particleCanvas.height = window.innerHeight;
        });

        const particles = [];
        const particleCount = 45;

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 100;
                this.size = Math.random() * 2.5 + 0.8;
                this.speedY = Math.random() * 1.2 + 0.4;
                this.speedX = (Math.random() - 0.5) * 0.6;
                this.opacity = Math.random() * 0.6 + 0.2;
                this.color = Math.random() > 0.3 ? '#9d4edd' : '#ff0055';
            }

            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                if (this.y < -10) {
                    this.reset();
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.shadowBlur = 12;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function renderParticles() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(renderParticles);
        }

        renderParticles();
    }
});
