/* =========================
   ✨ INTERACTIVE WHITE GLOWY PARTICLE SYSTEM WITH TSPARTICLES
   Repulse mode on hover - particles push away from mouse
========================= */

tsParticles.load("tsparticles", {
    fullScreen: { enable: false },
    particles: {
        number: { value: 150 },
        color: { value: "#ffffff" },
        size: { value: { min: 1.5, max: 4.5 } },
        opacity: { value: 0.8 },
        move: { enable: true, speed: 0.5 },
        links: { 
            enable: true, 
            color: "#ffffff", 
            opacity: 0.5, 
            distance: 120, 
            width: 1.5 
        },
        shadow: { enable: true, color: "rgba(255, 255, 255, 0.5)", blur: 8 }
    },
    interactivity: {
        events: { onHover: { enable: true, mode: "repulse" } },
        modes: { repulse: { distance: 120 } }
    }
});

/* =========================
   🗳 QUICKPOLL FUNCTIONALITY
============================= */

const overlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalConfirm = document.getElementById("modalConfirm");
const modalCancel = document.getElementById("modalCancel");
const modalInput = document.getElementById("modalInput");

let modalAction = null;
let pendingVoteIndex = null;

function openModal(type, customMsg = ""){
    overlay.classList.add("active");
    modalInput.style.display="none";
    modalInput.value="";
    modalCancel.style.display="inline-block";

    if(type==="reset"){
        modalTitle.innerText="Reset Poll?";
        modalText.innerText="This will permanently delete the poll.";
        modalConfirm.innerText="Reset";
        modalConfirm.classList.remove("primary","danger");
        modalConfirm.classList.add("danger");
        modalAction=resetPoll;
    }
    else if(type==="new"){
        modalTitle.innerText="Create New Poll?";
        modalText.innerText="Current poll will be lost.";
        modalConfirm.innerText="Create";
        modalConfirm.classList.remove("primary","danger");
        modalConfirm.classList.add("primary");
        modalAction=createNewPoll;
    }
    else if(type==="vote"){
        modalTitle.innerText="Enter Your Name";
        modalText.innerText="";
        modalConfirm.innerText="Submit Vote";
        modalConfirm.classList.remove("primary","danger");
        modalConfirm.classList.add("primary");
        modalInput.style.display="block";
        modalInput.focus();
        modalAction=submitVote;
    }
    else if(type==="error"){
        modalTitle.innerText="Oops!";
        modalText.innerText=customMsg;
        modalConfirm.innerText="Got it";
        modalConfirm.classList.remove("primary","danger");
        modalConfirm.classList.add("primary");
        modalCancel.style.display="none"; // Only one button for errors
        modalAction=()=>overlay.classList.remove("active");
    }
}

modalCancel.onclick=()=> overlay.classList.remove("active");
modalConfirm.onclick=()=> { if(modalAction) modalAction(); };

function submitVote(){
    const name = modalInput.value.trim();
    if(!name) return;
    overlay.classList.remove("active");
    allPolls[currentPollId].options[pendingVoteIndex].votes++;
    allPolls[currentPollId].options[pendingVoteIndex].voters.push(name);
    votedPolls[currentPollId]=true;
    localStorage.setItem("allPolls",JSON.stringify(allPolls));
    localStorage.setItem("votedPolls",JSON.stringify(votedPolls));
    
    // White glowy confetti
    confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#e0e7ff', '#f5f3ff', '#ffffff']
    });
    confetti({
        particleCount: 50,
        spread: 120,
        origin: { x: 0.1, y: 0.3 },
        colors: ['#e0e7ff', '#f5f3ff']
    });
    confetti({
        particleCount: 50,
        spread: 120,
        origin: { x: 0.9, y: 0.3 },
        colors: ['#e0e7ff', '#f5f3ff']
    });
    
    renderPoll();
}

/* =============================
    🗳 POLL SYSTEM
============================= */

let allPolls=JSON.parse(localStorage.getItem("allPolls"))||{};
let votedPolls=JSON.parse(localStorage.getItem("votedPolls"))||{};
let currentPollId=null;

function generateId(){return "poll-"+Math.floor(Math.random()*1000000);}

function initDefaultOptions(){
    addOption();
    addOption();
}
if(!location.hash) initDefaultOptions();

function addOption(){
    const wrapper=document.createElement("div");
    wrapper.className="option-wrapper";
    const input=document.createElement("input");
    input.type="text";
    input.className="optionInput";
    input.placeholder="Option "+(document.querySelectorAll(".optionInput").length+1);
    wrapper.appendChild(input);

    if(document.querySelectorAll(".optionInput").length>=2){
        const remove=document.createElement("div");
        remove.className="remove-option";
        remove.innerText="×";
        wrapper.appendChild(remove);
    }
    document.getElementById("optionInputs").appendChild(wrapper);
}

function createPoll(){
    let q=document.getElementById("question").value.trim();
    let inputs=document.querySelectorAll(".optionInput");
    let opts=[];

    inputs.forEach(i=>{
        if(i.value.trim()!=="") opts.push({text:i.value,votes:0,voters:[]});
    });

    if(q===""||opts.length<2){
        const container = document.querySelector(".container");
        container.classList.add("shake");
        setTimeout(()=>container.classList.remove("shake"), 400);
        openModal("error", "Please enter a question and at least 2 options.");
        return;
    }

    let id=generateId();
    currentPollId=id;
    allPolls[id]={question:q,options:opts};
    localStorage.setItem("allPolls",JSON.stringify(allPolls));
    location.hash=id;
    renderPoll();
}

function renderPoll(){
    let poll=allPolls[currentPollId];
    if(!poll) return;
    
    document.getElementById("createSection").style.display="none";
    document.getElementById("pollSection").style.display="block";
    document.getElementById("pollQuestion").innerText=poll.question;

    let container=document.getElementById("optionsContainer");
    container.innerHTML="";
    let total=poll.options.reduce((s,o)=>s+o.votes,0);

    poll.options.forEach((o,i)=>{
        let percent=total?((o.votes/total)*100).toFixed(1):0;
        const isVoted = votedPolls[currentPollId];
        container.innerHTML+=`
            <div class="option-block">
                <div class="option-header">
                    <div class="option-name">${o.text}</div>
                    <div class="option-meta">${percent}% (${o.votes})</div>
                </div>
                <button class="option-btn ${isVoted ? 'voted' : ''}"
                    ${isVoted ? "disabled" : ""}
                    data-index="${i}">
                    ${isVoted ? '✓ Voted' : 'Vote'}
                </button>
                <div class="result-bar">
                    <div class="fill" id="fill-${i}" style="width: 0%"></div>
                </div>
            </div>
        `;
        // Trigger animation after a tiny delay so the DOM can catch up
        setTimeout(() => {
            const fillBar = document.getElementById(`fill-${i}`);
            if(fillBar) fillBar.style.width = percent + "%";
        }, 50);
    });

    document.getElementById("shareLink").innerText=location.href;
}

function vote(i){
    if(votedPolls[currentPollId]) return;
    pendingVoteIndex=i;
    openModal("vote");
}

function toggleVoters(){
    let box=document.getElementById("votersList");
    if(box.style.display==="block"){
        box.style.display="none";
        return;
    }

    let poll=allPolls[currentPollId];
    let html="";
    let count = 0;

    poll.options.forEach(o=>{
        o.voters.forEach(name=>{
            html += `<div style="padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.15);">👤 <strong>${name}</strong> voted for <span style="color: #e0e7ff">"${o.text}"</span></div>`;
            count++;
        });
    });

    box.innerHTML = count > 0 ? html : "No votes yet";
    box.style.display="block";
}

function copyLink(){
    navigator.clipboard.writeText(location.href);
    const btn=document.getElementById("copyBtn");
    btn.innerText="Copied!";
    setTimeout(()=>btn.innerText="Copy Link",1500);
}

function shareWhatsApp(){
    window.open("https://wa.me/?text="+encodeURIComponent("Vote in my QuickPoll: "+location.href));
}

function resetPoll(){
    delete allPolls[currentPollId];
    delete votedPolls[currentPollId];
    localStorage.setItem("allPolls",JSON.stringify(allPolls));
    location.hash = "";
    location.reload();
}

function createNewPoll(){
    location.hash="";
    location.reload();
}

function loadFromHash(){
    let hash=location.hash.substring(1);
    if(hash&&allPolls[hash]){
        currentPollId=hash;
        renderPoll();
    }
}
window.onhashchange = loadFromHash;
loadFromHash();

/* =============================
   🎯 CENTRALIZED EVENT DELEGATION
============================= */

document.addEventListener("click", (event) => {
    const target = event.target;
    const action = target.getAttribute("data-action");
    
    if(!action) {
        // Handle remove option button
        if(target.classList.contains("remove-option")) {
            target.closest(".option-wrapper").remove();
        }
        // Handle option button clicks for voting
        if(target.classList.contains("option-btn") && 
           target.getAttribute("data-index") !== null &&
           !target.disabled) {
            const index = parseInt(target.getAttribute("data-index"));
            vote(index);
        }
        return;
    }
    
    // Handle data-action buttons
    switch(action) {
        case "addOption":
            addOption();
            break;
        case "createPoll":
            createPoll();
            break;
        case "toggleVoters":
            toggleVoters();
            break;
        case "copyLink":
            copyLink();
            break;
        case "shareWhatsApp":
            shareWhatsApp();
            break;
        case "resetPoll":
            openModal("reset");
            break;
        case "createNewPoll":
            openModal("new");
            break;
    }
});