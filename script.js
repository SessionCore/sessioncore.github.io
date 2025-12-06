let mouseX = -9999;
let mouseY = -9999;
const repulsionRadius = 100;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 40;
const connectionDistance = 150;
const speed = 0.3;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.initialVx = this.vx;
        this.initialVy = this.vy;
        this.size = Math.random() * 2;
    }

    update() {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.vx = this.initialVx;
        this.vy = this.initialVy;

        if (dist < repulsionRadius) {
            const force = (repulsionRadius - dist) / repulsionRadius * 0.5;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * force;
            this.vy += Math.sin(angle) * force;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) { this.vx *= -1; this.initialVx *= -1; }
        if (this.y < 0 || this.y > height) { this.vy *= -1; this.initialVy *= -1; }
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    resize();
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
                ctx.strokeStyle = `rgba(255,255,255,${0.1 - (dist / connectionDistance) * 0.1})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

const versionTagEl = document.getElementById('version-tag');
const downloadButtonEl = document.getElementById('download-button');
const downloadVersionEl = document.getElementById('download-version');
const downloadJarButtonEl = document.getElementById('download-jar-button');
const assetSizeEl = document.getElementById('asset-size');

const navbar = document.getElementById('navbar');

function handleScroll() {
    if (window.scrollY > 50) navbar.classList.add('scrolled-nav');
    else navbar.classList.remove('scrolled-nav');
}

window.addEventListener('scroll', handleScroll);

function formatBytes(bytes, decimals = 2) {
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return res;
            if (res.status === 403 && i < retries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(r => setTimeout(r, delay));
                continue;
            } else throw new Error(res.status);
        } catch {
            if (i === retries - 1) throw error;
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

async function fetchLatestJar() {
    const apiUrl = "https://api.github.com/repos/SessionCore/SessionCore/releases/latest";

    try {
        const res = await fetchWithRetry(apiUrl);
        const data = await res.json();
        const jar = data.assets.find(a => a.name.endsWith('.jar') || a.name.includes('SessionCore'));

        const version = data.tag_name;
        const downloadUrl = jar.browser_download_url;
        const size = formatBytes(jar.size);

        versionTagEl.innerHTML = `${version.toUpperCase()} <span class="text-white/60">STABLE RELEASE</span>`;
        downloadButtonEl.href = "#download";
        downloadButtonEl.classList.remove("opacity-50", "pointer-events-none");
        downloadButtonEl.textContent = "Download Latest";

        downloadVersionEl.textContent = version;
        downloadJarButtonEl.href = downloadUrl;
        downloadJarButtonEl.classList.remove("opacity-50", "pointer-events-none");
        assetSizeEl.textContent = size;

    } catch {
        const fallback = "https://github.com/SessionCore/SessionCore/releases";
        versionTagEl.innerHTML = "UPDATE FAILED <span class='text-red-400'>LINKING RELEASES...</span>";
        downloadButtonEl.href = fallback;
        downloadButtonEl.classList.remove("opacity-50", "pointer-events-none");
        downloadButtonEl.textContent = "Go to Releases Page";
        downloadVersionEl.textContent = "Failed to Load";
        downloadJarButtonEl.href = fallback;
        downloadJarButtonEl.classList.remove("opacity-50", "pointer-events-none");
        assetSizeEl.textContent = "Unknown Size";
    }
}

const logMessages = [
    '<span style="color:#60a5fa;">[SERVER]</span> <span style="color:#a78bfa;">[authlib-injector]</span> <span style="color:#34d399;">[INFO]</span> Version: 1.2.6',
    '<span style="color:#60a5fa;">[SERVER]</span> <span style="color:#a78bfa;">[authlib-injector]</span> <span style="color:#34d399;">[INFO]</span> Authentication server: <span style="color:#facc15;">https://auth.yourserver.com</span>',
    '<span style="color:#60a5fa;">[SERVER]</span> <span style="color:#a78bfa;">[authlib-injector]</span> <span style="color:#34d399;">[INFO]</span> Redirect to: <span style="color:#facc15;">https://auth.yourserver.com/api/yggdrasil</span>',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:38 INFO]: Starting minecraft server',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:38 INFO]: Preparing level "world"',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:39 INFO]: Preparing start region for dimension minecraft:overworld',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:39 INFO]: Time elapsed: 363 ms',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:39 INFO]: Preparing start region for dimension minecraft:the_nether',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:39 INFO]: Time elapsed: 147 ms',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:39 INFO]: Preparing start region for dimension minecraft:the_end',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:39 INFO]: Time elapsed: 366 ms',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:39 INFO]: Running delayed init tasks',
    '<span style="color:#60a5fa;">[SERVER]</span> [15:44:39 INFO]: Done (2.274s)! For help, type "help"'
];

const consoleOutputEl = document.getElementById('console-output');
let hasConsoleAnimated = false;

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function animateConsoleLog() {
    if (hasConsoleAnimated) return;
    hasConsoleAnimated = true;

    consoleOutputEl.innerHTML = '';

    for (const line of logMessages) {
        const p = document.createElement('p');
        p.className = 'opacity-0 transition-opacity duration-300 px-4 py-0';
        p.innerHTML = line;
        consoleOutputEl.appendChild(p);
        consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
        await sleep(10);
        p.classList.remove('opacity-0');
        await sleep(Math.random() * (250 - 50) + 50);
    }
}

function setupConsoleObserver() {
    const target = document.getElementById('security');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasConsoleAnimated) {
                animateConsoleLog();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(target);
}

window.onload = function () {
    init();
    animate();
    fetchLatestJar();
    setupConsoleObserver();
    handleScroll();
};

window.addEventListener('resize', resize);
