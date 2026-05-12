const routes = {
    '/': 'page-home',
    '/aboutme': 'page-aboutme',
    '/skills': 'page-skills',
    '/projects': 'page-projects',
    '/contact': 'page-contact',
}; 

function navigate(path) {
    const key = path.toLowerCase();
    const pageId = routes[key] || 'page-home';

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');

    document.querySelectorAll('nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.path === key);
    });

    history.pushState({ path: key }, '', key === '/' ? '/' : key);
}

document.querySelectorAll('nav a, [data-navigate]').forEach(el => {
    el.addEventListener('click', e => {
        e.preventDefault();
        navigate(el.dataset.path || '/');
    });
});

document.getElementById('logo-link').addEventListener('click', e => {
    e.preventDefault();
    navigate('/');
});

window.addEventListener('popstate', e => {
    navigate(e.state?.path || '/');
});

navigate(window.location.pathname || '/');

const nameInput = document.getElementById('contact-name');
const emailInput = document.getElementById('contact-email');
const messageInput = document.getElementById('contact-message');
const sendBtn = document.getElementById('send-btn');

function updateSendBtn() {
    const valid = nameInput.value.trim() && emailInput.value.trim() && messageInput.value.trim();
    sendBtn.disabled = !valid;
}

[nameInput, emailInput, messageInput].forEach(el =>
    el.addEventListener('input', updateSendBtn)
);

sendBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    if (!name || !email || !message) return;

    const subject = encodeURIComponent(`Portfolio Contact van ${name}`);
    const body = encodeURIComponent(`Naam: ${name}\nEmail: ${email}\n\nBericht:\n${message}`);
    window.open(`mailto:97095807@st.deltion.nl?subject=${subject}&body=${body}`);

    nameInput.value = '';
    emailInput.value = '';
    messageInput.value = '';
    updateSendBtn();
});

updateSendBtn();