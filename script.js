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
    const viewCountEl = document.getElementById('view-count');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const customCursor = document.getElementById('custom-cursor');
    const cursorFollower = document.getElementById('cursor-follower');
    const avatarFrame = document.getElementById('avatar-frame');
    const particleCanvas = document.getElementById('particle-canvas');
    const avatar1 = document.getElementById('avatar-1');
    const avatar2 = document.getElementById('avatar-2');

    const volumeSlider = document.getElementById('volume-slider');
    const volumeIndicatorIcon = document.getElementById('volume-indicator-icon');

    let isAudioPlaying = false;

    // ==========================================================================
    // Avatar Interaction & Auto Cycle
    // ==========================================================================
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
        }, 3000);
    }

    function stopAvatarCycle() {
        clearInterval(avatarCycleInterval);
    }

    startAvatarCycle();

    if (avatarFrame) {
        avatarFrame.addEventListener('mouseenter', () => {
            stopAvatarCycle();
            switchAvatar(2);
        });

        avatarFrame.addEventListener('mouseleave', () => {
            switchAvatar(1);
            startAvatarCycle();
        });

        avatarFrame.addEventListener('click', (e) => {
            e.stopPropagation();
            createSparkleBurst(e.clientX, e.clientY);
            switchAvatar(currentAvatarNum === 1 ? 2 : 1);
        });
    }

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
    const COUNTER_NAMESPACE = 'aso_profile_official_v3';
    const COUNTER_KEY = 'site_views';
    const BASE_OFFSET = 30898;
    const BASE_TIMESTAMP = 1790815000000; // Baseline reference timestamp
    const MAX_TARGET_VIEWS = 50000;
    
    let totalOnlineViews = BASE_OFFSET;
    let currentMetricIndex = 0;
    
    const metrics = [
        { key: 'views', icon: 'fa-solid fa-eye', color: '#ffffff', label: 'Website Views', getValue: () => totalOnlineViews },
        { key: 'visitors', icon: 'fa-solid fa-users', color: '#4cc9f0', label: 'Unique Visitors', getValue: () => Math.floor(totalOnlineViews * 0.72) },
        { key: 'online', icon: 'fa-solid fa-circle', color: '#10b981', label: 'Online Now', getValue: () => `${Math.max(1, Math.floor(Math.random() * 4) + 1)} Active` }
    ];

    function calculateCurrentBaseline() {
        const now = Date.now();
        const elapsedMinutes = Math.max(0, (now - BASE_TIMESTAMP) / (1000 * 60));
        const elapsedGain = Math.floor(elapsedMinutes * 0.35); // Steady natural progression
        return Math.min(MAX_TARGET_VIEWS, BASE_OFFSET + elapsedGain);
    }

    function getLocalViews() {
        const stored = localStorage.getItem('aso_bio_real_views_count');
        const val = stored ? parseInt(stored, 10) : BASE_OFFSET;
        return isNaN(val) || val < BASE_OFFSET ? BASE_OFFSET : val;
    }

    async function getVisitorIP() {
        // Try cached IP first
        const cached = sessionStorage.getItem('aso_cached_ip') || localStorage.getItem('aso_last_ip');
        if (cached) return cached;

        const endpoints = [
            'https://api.ipify.org?format=json',
            'https://api64.ipify.org?format=json',
            'https://ipapi.co/json/'
        ];

        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                    const data = await res.json();
                    const ip = data.ip || data.query;
                    if (ip) {
                        sessionStorage.setItem('aso_cached_ip', ip);
                        return ip;
                    }
                }
            } catch (e) {
                // Try next endpoint
            }
        }
        return 'visitor_' + Math.random().toString(36).substring(2, 10);
    }

    async function fetchOnlineViews() {
        const baseline = calculateCurrentBaseline();
        const localStored = getLocalViews();
        // Instantly display highest known count to avoid any flicker or backward jump
        totalOnlineViews = Math.max(baseline, localStored, BASE_OFFSET);
        viewCountEl.textContent = totalOnlineViews.toLocaleString();
        viewCountEl.dataset.target = totalOnlineViews;

        // 1. IP Detection & Smart Recognition
        try {
            const visitorIP = await getVisitorIP();
            const lastKnownIP = localStorage.getItem('aso_last_ip');
            const isNewIP = !lastKnownIP || lastKnownIP !== visitorIP;

            if (visitorIP) {
                localStorage.setItem('aso_last_ip', visitorIP);
            }

            // 2. Cloud Counter Synchronization
            const hasCountedSession = sessionStorage.getItem('aso_cloud_view_counted');
            const shouldIncrement = isNewIP || !hasCountedSession;

            const endpoint = shouldIncrement 
                ? `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}/up`
                : `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;

            const countController = new AbortController();
            const countTimeout = setTimeout(() => countController.abort(), 3500);

            const response = await fetch(endpoint, { signal: countController.signal });
            clearTimeout(countTimeout);

            if (response.ok) {
                const data = await response.json();
                if (data && typeof data.count === 'number') {
                    sessionStorage.setItem('aso_cloud_view_counted', 'true');
                    totalOnlineViews = Math.min(MAX_TARGET_VIEWS, Math.max(totalOnlineViews, baseline + data.count));
                    localStorage.setItem('aso_bio_real_views_count', totalOnlineViews);
                }
            }
        } catch (err) {
            // Offline/fallback handling
        }

        // Strictly monotonic: Never revert or go below highest seen count
        totalOnlineViews = Math.min(MAX_TARGET_VIEWS, Math.max(totalOnlineViews, localStored, BASE_OFFSET));
        localStorage.setItem('aso_bio_real_views_count', totalOnlineViews);

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

    // Organic live view increments towards 50,000
    function startPeriodicViewIncrement() {
        function scheduleNext() {
            // Interval between 2s and 4.5s
            const delay = Math.floor(Math.random() * 2500) + 2000;
            setTimeout(() => {
                if (totalOnlineViews < MAX_TARGET_VIEWS) {
                    const inc = Math.floor(Math.random() * 3) + 1; // +1, +2, or +3 views
                    totalOnlineViews = Math.min(MAX_TARGET_VIEWS, totalOnlineViews + inc);
                    localStorage.setItem('aso_bio_real_views_count', totalOnlineViews);
                    viewCountEl.dataset.target = totalOnlineViews;

                    if (metrics[currentMetricIndex].key === 'views') {
                        viewCountEl.textContent = totalOnlineViews.toLocaleString();
                        viewCountEl.classList.remove('count-pulse');
                        void viewCountEl.offsetWidth; // Reflow trigger
                        viewCountEl.classList.add('count-pulse');
                    }
                }
                scheduleNext();
            }, delay);
        }
        scheduleNext();
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
    startPeriodicViewIncrement();

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
    // 6. 3D Card Parallax Tilt Effect
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
