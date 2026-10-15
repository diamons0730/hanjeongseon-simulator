"use strict";

const RANKING_KEY = "hanjeongseon-rankings-v1";
const TUTORIAL_KEY = "hanjeongseon-tutorial-complete-v1";
const $ = (id) => document.getElementById(id);
const ingredients = [
  { id: "dough", name: "찹쌀떡 피", icon: "◌", price: 700, color: "#fff0d7" },
  { id: "paste", name: "달콤한 팥소", icon: "●", price: 500, color: "#98563f", category: "filling" },
  { id: "yogurt", name: "상큼한 요거트 소", icon: "●", price: 600, color: "#f3d8e8", category: "filling" },
  { id: "strawberry", name: "생딸기", icon: "●", price: 1700, color: "#e95d55", category: "fruit" },
  { id: "mango", name: "생망고", icon: "●", price: 1900, color: "#f2b94b", category: "fruit" },
  { id: "grape", name: "청포도", icon: "●", price: 1800, color: "#86ae72", category: "fruit" },
  { id: "peach", name: "복숭아", icon: "●", price: 1800, color: "#ed9b91", category: "fruit" },
  { id: "kiwi", name: "키위", icon: "●", price: 1600, color: "#86a65d", category: "fruit" },
  { id: "wrap", name: "보자기 상자", icon: "▣", price: 500, color: "#c68173" }
];
const customers = [
  { type: "office", name: "차분한 직장인", fruit: "strawberry", filling: "paste", order: "딸기 팥소 찹쌀떡 2개", price: 9000, detail: "선물 포장으로 부탁드려요.", patience: 65, icon: "👜", skin: "#eec1a1", hair: "#4a342d", shirt: "#7e9b8b" },
  { type: "influencer", name: "감성 인플루언서", fruit: "mango", filling: "yogurt", order: "망고 요거트 찹쌀떡 1개", price: 6000, detail: "사진도 예쁘게 찍고 싶어요!", patience: 62, icon: "📸", skin: "#f0c3a2", hair: "#583b31", shirt: "#c78391" },
  { type: "student", name: "학교 앞 단골 학생", fruit: "grape", filling: "paste", order: "청포도 팥소 찹쌀떡 2개", price: 9000, detail: "친구랑 나눠 먹을 거예요.", patience: 70, icon: "🎒", skin: "#e9b998", hair: "#342c29", shirt: "#7599ad" },
  { type: "artist", name: "동네 공방 작가", fruit: "peach", filling: "yogurt", order: "복숭아 요거트 찹쌀떡 1개", price: 6000, detail: "오늘도 향이 참 좋네요.", patience: 66, icon: "🎨", skin: "#efc3a1", hair: "#73503b", shirt: "#b19669" },
  { type: "office", name: "근처 회사 손님", fruit: "kiwi", filling: "paste", order: "키위 팥소 찹쌀떡 2개", price: 9000, detail: "오후 회의 전에 들렀어요.", patience: 64, icon: "💼", skin: "#e9bda1", hair: "#3d302a", shirt: "#8f879f" },
  { type: "student", name: "웃음 많은 단골", fruit: "strawberry", filling: "yogurt", order: "딸기 요거트 찹쌀떡 1개", price: 6000, detail: "오늘은 요거트 소로 부탁해요.", patience: 70, icon: "🌷", skin: "#f0c4a3", hair: "#5c4034", shirt: "#9aac77" }
];
const recipe = [
  { id: "dough", name: "찹쌀떡 피", prompt: "쫀득한 찹쌀떡 피를 펼쳐요.", color: "#fff0d7", icon: "◌" },
  { id: "paste", name: "달콤한 팥소", prompt: "고운 팥소를 가운데 올려요.", color: "#98563f", icon: "●" },
  { id: "yogurt", name: "상큼한 요거트 소", prompt: "상큼한 요거트 소를 가운데 올려요.", color: "#f3d8e8", icon: "●" },
  { id: "wrap", name: "보자기 포장", prompt: "상자를 보자기로 감싸 매듭을 지어요.", color: "#c68173", icon: "▣" }
];
const upgrades = [
  { id: "chairs", name: "웨이팅 의자", price: 8000, description: "손님 인내심 +15초 · 구매할수록 가격이 오릅니다.", icon: "⌂" },
  { id: "knife", name: "고급 과일 칼", price: 12000, description: "과일 손질 드래그 1회당 과일 2개를 손질합니다.", icon: "✧" },
  { id: "silk", name: "실크 보자기", price: 10000, description: "손님 인내심 +8초 · 웨이팅 의자 효과와 중첩됩니다.", icon: "◇" }
];
const state = {
  day: 1, money: 22000, reputation: 80, phase: "prep",
  stock: { dough: 0, paste: 0, yogurt: 0, wrap: 0, strawberry: 0, mango: 0, grape: 0, peach: 0, kiwi: 0,
    ready_strawberry: 0, ready_mango: 0, ready_grape: 0, ready_peach: 0, ready_kiwi: 0 },
  queue: [], customer: null, orderAccepted: false, recipeStep: 0,
  served: 0, left: 0, sales: 0, cleaning: 0, rankSaved: false,
  upgrades: { chairs: 0, knife: 0, silk: 0 }
};

let modal = false;
let installEvent = null;
let lastTick = performance.now();
const customerNodes = new Map();
let selectedMaterial = null;
let activeDrag = null;
let dragGhost = null;
let suppressMaterialClickUntil = 0;
let tutorialIndex = 0;

function won(value) {
  return `₩ ${Math.round(value).toLocaleString("ko-KR")}`;
}

function makeElement(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function recipePlanFor(customer) {
  const singlePiece = ["dough", customer?.filling, `ready_${customer?.fruit}`];
  return customer?.order.includes("2개") ? [...singlePiece, ...singlePiece, "wrap"] : [...singlePiece, "wrap"];
}

function dayOrderPlan() {
  return customers.slice(0, customerCountForDay());
}

function customerCountForDay() {
  return Math.min(customers.length, 3 + Math.floor(state.day / 2));
}

function dayRequirements() {
  const orders = dayOrderPlan();
  const portions = orders.reduce((count, customer) => count + (customer.order.includes("2개") ? 2 : 1), 0);
  const fruitNeeds = {};
  const fillingNeeds = {};
  orders.forEach((customer) => {
    const amount = customer.order.includes("2개") ? 2 : 1;
    fruitNeeds[customer.fruit] = (fruitNeeds[customer.fruit] || 0) + amount;
    fillingNeeds[customer.filling] = (fillingNeeds[customer.filling] || 0) + amount;
  });
  return { portions, wraps: orders.length, fruitNeeds, fillingNeeds };
}

function availableStock(ingredientId) {
  return state.stock[ingredientId];
}

function stockReadyForDay() {
  const needs = dayRequirements();
  const fillingsReady = Object.entries(needs.fillingNeeds).every(([id, amount]) => state.stock[id] >= amount);
  const fruitsReady = Object.entries(needs.fruitNeeds).every(([id, amount]) => state.stock[`ready_${id}`] >= amount);
  return state.stock.dough >= needs.portions && fillingsReady && fruitsReady && state.stock.wrap >= needs.wraps;
}

function missingStockSummary() {
  const needs = dayRequirements();
  const missing = [];
  for (const [id, amount] of [["dough", needs.portions], ["wrap", needs.wraps], ...Object.entries(needs.fillingNeeds)]) {
    const short = Math.max(0, amount - state.stock[id]);
    if (short) missing.push(`${ingredients.find((item) => item.id === id).name} ${short}개`);
  }
  Object.entries(needs.fruitNeeds).forEach(([id, amount]) => {
    const short = Math.max(0, amount - state.stock[id] - state.stock[`ready_${id}`]);
    const prepShort = Math.max(0, amount - state.stock[`ready_${id}`]);
    if (short) missing.push(`${ingredients.find((item) => item.id === id).name} ${short}개`);
    if (prepShort) missing.push(`손질할 ${ingredients.find((item) => item.id === id).name.replace("생", "")} ${prepShort}개`);
  });
  return missing;
}

function customerPatience(customer) {
  return customer.patience + state.upgrades.chairs * 15 + state.upgrades.silk * 8;
}

function moodOf(customer) {
  const ratio = customer.wait / customerPatience(customer);
  if (ratio >= 0.72) return "mood-red";
  if (ratio >= 0.42) return "mood-yellow";
  return "mood-green";
}

function renderHud() {
  $("day-label").textContent = `DAY ${String(state.day).padStart(2, "0")}`;
  $("phase-label").textContent = ({ prep: "오픈 준비", open: "영업 중", cleaning: "마감 청소", report: "오늘의 정산" })[state.phase];
  $("money-label").textContent = Math.max(0, state.money).toLocaleString("ko-KR");
  $("reputation-label").textContent = String(state.reputation);
  $("sales-label").textContent = won(state.sales);
  $("served-label").textContent = `${state.served}명`;
  $("left-label").textContent = `${state.left}명`;
  const completed = state.served + state.left;
  const total = state.phase === "open" ? state.queue.length + Number(Boolean(state.customer)) + completed : state.phase === "prep" ? customerCountForDay() : completed;
  $("today-count").textContent = `${completed} / ${total}명`;
  $("day-progress").style.width = `${total ? Math.min(100, completed / total * 100) : 0}%`;
  const isOpen = state.phase === "open";
  $("open-sign").textContent = isOpen ? "영업 중" : state.phase === "cleaning" ? "마감 중" : state.phase === "report" ? "정산 완료" : "준비 중";
  $("open-sign").classList.toggle("is-open", isOpen);
  $("status-dot").classList.toggle("is-open", isOpen);
  $("scene-status").textContent = isOpen ? "따뜻한 떡을 만들고 있어요" : state.phase === "cleaning" ? "마감 청소 중" : state.phase === "report" ? "오늘 영업을 마쳤어요" : "영업 준비 중";
  $("queue-count").textContent = `대기 ${state.queue.length}명`;
  $("counter-note").textContent = isOpen ? "정성껏 빚은 떡을 준비 중이에요" : "오늘도 따뜻한 떡을 준비해요";
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function openModal(title, description, content, actions = [], kicker = "HANJEONGSEON · SHOP LIFE") {
  modal = true;
  $("modal-kicker").textContent = kicker;
  $("modal-title").textContent = title;
  $("modal-description").textContent = description;
  $("modal-content").replaceChildren();
  if (content instanceof Node) $("modal-content").append(content);
  else if (content) $("modal-content").textContent = content;
  const footer = $("modal-actions");
  footer.replaceChildren();
  actions.forEach(({ label, action, kind = "primary", disabled = false }) => {
    const button = makeElement("button", `ui-button ${kind}`, label);
    button.type = "button";
    button.disabled = disabled;
    button.addEventListener("click", action);
    footer.append(button);
  });
  $("interaction-modal").hidden = false;
}

function closeModal() {
  $("interaction-modal").hidden = true;
  modal = false;
}

function makePerson(customer, active = false) {
  const card = makeElement("div", "npc-card");
  const figure = makeElement("div", "person");
  figure.style.setProperty("--skin", customer.skin);
  figure.style.setProperty("--hair", customer.hair);
  figure.style.setProperty("--shirt", customer.shirt);
  figure.append(makeElement("span", "hair"), makeElement("span", "head"), makeElement("span", "body"), makeElement("span", "legs"));
  if (customer.type === "influencer" || customer.type === "student") figure.append(makeElement("span", "accessory", customer.type === "influencer" ? "✦" : "◉"));
  card.append(makeElement("span", "mood-ring"), makeElement("span", "npc-bubble"), figure);
  card.append(makeElement("span", "npc-name", customer.name));
  card.dataset.customerId = customer.id;
  updatePerson(card, customer, active);
  return card;
}

function updatePerson(card, customer, active) {
  const mood = moodOf(customer);
  card.classList.toggle("active", active);
  card.classList.toggle("mood-green", mood === "mood-green");
  card.classList.toggle("mood-yellow", mood === "mood-yellow");
  card.classList.toggle("mood-red", mood === "mood-red");
  const bubble = card.querySelector(".npc-bubble");
  if (bubble.textContent !== customer.order) bubble.textContent = customer.order;
}

function renderScene() {
  const activeSlot = $("active-customer");
  const waitingLine = $("waiting-line");
  const visibleCustomers = [];
  if (state.customer && state.phase === "open") {
    visibleCustomers.push(state.customer);
  }
  visibleCustomers.push(...state.queue.slice(0, 4));
  const visibleIds = new Set(visibleCustomers.map((customer) => customer.id));
  for (const [id, node] of customerNodes) {
    if (!visibleIds.has(id)) {
      node.remove();
      customerNodes.delete(id);
    }
  }

  if (state.customer && state.phase === "open") {
    const activePerson = getPersonNode(state.customer, true);
    if (activeSlot.firstElementChild !== activePerson) activeSlot.replaceChildren(activePerson);
  } else {
    const emptyMessage = state.phase === "prep" ? "오픈 준비 중이에요" :
      state.phase === "cleaning" || state.phase === "report" ? "오늘도 고생하셨어요" :
      "다음 손님을 기다리고 있어요";
    if (activeSlot.firstElementChild?.className !== "order-empty" || activeSlot.firstElementChild.textContent !== emptyMessage) {
      activeSlot.replaceChildren(makeElement("div", "order-empty", emptyMessage));
    }
  }
  state.queue.slice(0, 4).forEach((customer, index) => {
    const person = getPersonNode(customer, false);
    const currentAtIndex = waitingLine.children[index];
    if (currentAtIndex !== person) waitingLine.insertBefore(person, currentAtIndex || null);
  });
  $("queue-count").textContent = `대기 ${state.queue.length}명`;
}

function renderWorkbench() {
  const card = $("workbench-card");
  const preparing = state.phase === "prep";
  const customerActive = state.phase === "open" && Boolean(state.customer) && state.orderAccepted;
  const plan = customerActive ? recipePlanFor(state.customer) : [];
  const step = customerActive ? state.recipeStep : 0;
  const currentRecipeIndex = plan[step];
  const isComplete = customerActive && step >= plan.length;
  const needs = dayRequirements();
  const preparedFruitCount = Object.keys(needs.fruitNeeds).reduce((sum, id) => sum + state.stock[`ready_${id}`], 0);
  const requiredFruitCount = Object.values(needs.fruitNeeds).reduce((sum, amount) => sum + amount, 0);
  const fruitId = currentRecipeIndex?.startsWith("ready_") ? currentRecipeIndex.slice(6) : null;
  const currentIngredient = customerActive && !isComplete
    ? fruitId
      ? { ...ingredients.find((item) => item.id === fruitId), name: `손질한 ${ingredients.find((item) => item.id === fruitId).name.replace("생", "")}`, prompt: "신선한 과일을 올려요." }
      : recipe.find((item) => item.id === currentRecipeIndex)
    : null;
  const title = makeElement("div", "workbench-title");
  title.append(makeElement("strong", "", "한정선 떡 제조 작업대"), makeElement("span", "", "KITCHEN · DRAG TO MAKE"));
  card.classList.toggle("is-active", Boolean(customerActive));
  card.replaceChildren(title);

  const progressLabel = customerActive
    ? isComplete ? `${plan.length} / ${plan.length} · 완성` : `${step} / ${plan.length} 단계 완료`
    : preparing ? `${preparedFruitCount} / ${requiredFruitCount} · 과일 손질`
      : "손님 주문 접수 후 제조를 시작해요";

  const progress = makeElement("div", "workbench-progress");
  progress.append(makeElement("strong", "", progressLabel));
  progress.append(makeElement("span", "", customerActive ? `${state.customer.order}` : preparing ? "과일도 직접 손질해요" : "주문 대기"));
  card.append(progress);

  const product = makeElement("div", `workbench-art${isComplete ? " finished" : ""}`);
  product.setAttribute("aria-label", isComplete ? "보자기 포장한 완성 떡" : "떡을 만드는 작업판");
  product.append(makeElement("span", "workbench-tag",
    preparing ? "과일 손질판" : currentIngredient ? `다음 재료 · ${currentIngredient.name}` : isComplete ? "완성된 보자기 떡" : "작업 대기 중"));
  const board = makeElement("div", "workbench-board");
  if (customerActive && step > 0) {
    const stack = makeElement("span", `workbench-food${isComplete ? " is-wrapped" : ""}`);
    if (currentIngredient) stack.style.setProperty("--food-color", currentIngredient.color);
    const usedFruitId = plan.slice(0, step).find((item) => item.startsWith("ready_"));
    if (usedFruitId) stack.style.setProperty("--fruit-color", ingredients.find((item) => item.id === usedFruitId.slice(6)).color);
    board.append(stack);
  } else if (preparing && preparedFruitCount) {
    board.append(makeElement("span", "prepared-fruit", `${preparedFruitCount}개 손질 완료`));
  }
  product.append(board);

  const dropTarget = makeElement("button", "drop-target", "");
  dropTarget.type = "button";
  const dropMode = preparing ? "prep-fruit" : "recipe-stage";
  dropTarget.dataset.dropTarget = dropMode;
  dropTarget.disabled = preparing
    ? !Object.entries(needs.fruitNeeds).some(([id, amount]) => state.stock[id] > 0 && state.stock[`ready_${id}`] < amount)
    : !customerActive || isComplete;
  const dropTitle = preparing ? "손질할 과일을 여기에 끌어 놓으세요" :
    !customerActive ? "주문을 접수하면 재료를 놓을 수 있어요" :
      isComplete ? "완성! 카운터에서 POS 결제" : `${currentIngredient.name}을(를) 여기에 놓으세요`;
  dropTarget.append(makeElement("strong", "", dropTitle),
    makeElement("small", "", preparing ? `손질 완료 ${preparedFruitCount} / ${requiredFruitCount} · 주문 과일에 맞춰 손질하세요` : "올바른 순서로 놓아야 다음 단계로 진행합니다"));
  dropTarget.setAttribute("aria-label", `${dropTitle}. 재료를 선택한 뒤 이 버튼을 누르거나 끌어다 놓으세요.`);
  dropTarget.addEventListener("click", () => {
    if (!selectedMaterial) return;
    const material = selectedMaterial;
    selectedMaterial = null;
    handleMaterialDrop(material, dropMode);
  });
  product.append(dropTarget);
  card.append(product);

  const inventory = makeElement("div", "material-palette");
  if (preparing) {
    Object.keys(needs.fruitNeeds).forEach((id) => {
      inventory.append(makeMaterialToken(id, ingredients.find((item) => item.id === id).name, state.stock[id]));
    });
  } else {
    inventory.append(makeMaterialToken("dough", "떡피", state.stock.dough));
    Object.keys(needs.fillingNeeds).forEach((id) => {
      inventory.append(makeMaterialToken(id, ingredients.find((item) => item.id === id).name, state.stock[id]));
    });
    Object.keys(needs.fruitNeeds).forEach((id) => {
      inventory.append(makeMaterialToken(`ready_${id}`, `손질 ${ingredients.find((item) => item.id === id).name.replace("생", "")}`, state.stock[`ready_${id}`]));
    });
    inventory.append(makeMaterialToken("wrap", "보자기", state.stock.wrap));
  }
  card.append(inventory);
  const hint = preparing
    ? "딸기·망고·청포도·복숭아·키위 중 오늘 주문에 맞는 과일을 구매해 손질판으로 드래그하세요."
    : customerActive
      ? isComplete ? "완성품을 손님에게 건네고 POS 결제를 진행하세요." : `순서가 틀리면 손님 인내심이 4초 줄어듭니다. ${currentIngredient.prompt}`
      : "재료를 미리 구매하고 과일을 손질해야 가게 문을 열 수 있어요.";
  card.append(makeElement("p", "workbench-hint", hint));
  wireMaterialInteractions(card);
}

function makeMaterialToken(id, label, amount) {
  const ingredient = ingredients.find((item) => item.id === (id.startsWith("ready_") ? id.slice(6) : id));
  const token = makeElement("button", "material-token", "");
  token.type = "button";
  token.dataset.material = id;
  token.disabled = amount <= 0;
  token.setAttribute("aria-pressed", String(selectedMaterial === id));
  token.setAttribute("aria-label", `${label} ${amount}개. 눌러 선택하거나 드래그하세요.`);
  const icon = makeElement("span", "material-icon", ingredient.icon);
  icon.style.setProperty("--ingredient-color", ingredient.color);
  token.append(icon, makeElement("strong", "", label), makeElement("small", "", `${amount}개`));
  if (selectedMaterial === id) token.classList.add("selected");
  return token;
}

function renderSupplyShop() {
  const card = $("supply-card");
  card.replaceChildren();
  const needs = dayRequirements();
  const heading = makeElement("div", "workbench-title");
  heading.append(makeElement("strong", "", "재료상 · 오늘의 발주"), makeElement("span", "", "SUPPLY SHOP"));
  card.append(heading);
  card.append(makeElement("p", "supply-caption", `오늘의 예상 소요량 · 떡 ${needs.portions}개 / 보자기 ${needs.wraps}개`));

  ingredients.forEach((ingredient) => {
    const row = makeElement("div", "supply-row");
    const icon = makeElement("span", "supply-icon", ingredient.icon);
    icon.style.setProperty("--ingredient-color", ingredient.color);
    const details = makeElement("div", "supply-copy");
    const count = ingredient.category === "fruit"
      ? `생과일 ${state.stock[ingredient.id]} · 손질 ${state.stock[`ready_${ingredient.id}`]}`
      : `보유 ${state.stock[ingredient.id]}개`;
    details.append(makeElement("strong", "", ingredient.name), makeElement("small", "", `${won(ingredient.price)} / 개 · ${count}`));
    const buttons = makeElement("div", "supply-buttons");
    [1, 3].forEach((amount) => {
      const purchase = makeElement("button", "supply-buy", `+${amount}`);
      purchase.type = "button";
      const stockCount = ingredient.category === "fruit" ? state.stock[ingredient.id] + state.stock[`ready_${ingredient.id}`] : state.stock[ingredient.id];
      purchase.disabled = state.money < ingredient.price * amount || stockCount + amount > 30;
      purchase.setAttribute("aria-label", `${ingredient.name} ${amount}개 구매 ${won(ingredient.price * amount)}`);
      purchase.addEventListener("click", () => buyIngredient(ingredient.id, amount));
      buttons.append(purchase);
    });
    row.append(icon, details, buttons);
    card.append(row);
  });
  const missing = missingStockSummary();
  const status = state.phase === "prep"
    ? stockReadyForDay() ? "필요한 재료와 손질이 준비됐어요." : `오픈 전 부족: ${missing.join(" · ") || "과일 손질"}`
    : state.phase === "open" ? `영업 중 · 남은 재고 ${Object.values(state.stock).reduce((sum, amount) => sum + amount, 0)}개`
      : "다음 영업에 사용할 남은 재료를 확인하세요.";
  card.append(makeElement("p", `supply-status${stockReadyForDay() && state.phase === "prep" ? " ready" : ""}`, status));
}

function wireMaterialInteractions(root) {
  root.querySelectorAll(".material-token:not(:disabled)").forEach((token) => {
    token.addEventListener("click", () => {
      if (Date.now() < suppressMaterialClickUntil) return;
      selectedMaterial = selectedMaterial === token.dataset.material ? null : token.dataset.material;
      root.querySelectorAll(".material-token").forEach((item) => {
        const selected = item.dataset.material === selectedMaterial;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
    });
    token.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      activeDrag = { token, material: token.dataset.material, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
    });
  });
}

function moveMaterialDrag(event) {
  if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
  const distance = Math.hypot(event.clientX - activeDrag.startX, event.clientY - activeDrag.startY);
  if (!activeDrag.moved && distance < 7) return;
  activeDrag.moved = true;
  if (!dragGhost) {
    dragGhost = makeElement("div", "drag-ghost", activeDrag.token.querySelector("strong").textContent);
    document.body.append(dragGhost);
  }
  dragGhost.style.left = `${event.clientX}px`;
  dragGhost.style.top = `${event.clientY}px`;
  activeDrag.token.classList.add("dragging");
}

function finishMaterialDrag(event) {
  if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
  const drag = activeDrag;
  const dropTarget = drag.moved ? document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-drop-target]") : null;
  activeDrag = null;
  dragGhost?.remove();
  dragGhost = null;
  drag.token.classList.remove("dragging");
  if (drag.moved) {
    suppressMaterialClickUntil = Date.now() + 350;
    selectedMaterial = null;
    if (dropTarget && !dropTarget.disabled) handleMaterialDrop(drag.material, dropTarget.dataset.dropTarget);
  }
}

function cancelMaterialDrag(event) {
  if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
  activeDrag.token.classList.remove("dragging");
  activeDrag = null;
  dragGhost?.remove();
  dragGhost = null;
}

function buyIngredient(ingredientId, amount) {
  const ingredient = ingredients.find((item) => item.id === ingredientId);
  const stockCount = ingredient.category === "fruit"
    ? state.stock[ingredientId] + state.stock[`ready_${ingredientId}`]
    : state.stock[ingredientId];
  const totalPrice = ingredient.price * amount;
  if (state.money < totalPrice || stockCount + amount > 30) {
    showToast("잔액이나 보관 공간이 부족해 재료를 살 수 없어요.");
    return;
  }
  state.money -= totalPrice;
  state.stock[ingredientId] += amount;
  renderAll();
  showToast(`${ingredient.name} ${amount}개 구매 · ${won(totalPrice)}`);
}

function handleMaterialDrop(materialId, target) {
  if (target === "prep-fruit" && state.phase === "prep") {
    const needs = dayRequirements();
    const fruit = ingredients.find((item) => item.id === materialId && item.category === "fruit");
    if (!fruit || state.stock[materialId] <= 0 || !needs.fruitNeeds[materialId] ||
      state.stock[`ready_${materialId}`] >= needs.fruitNeeds[materialId]) {
      showToast("오늘 주문에 필요한 과일만 손질할 수 있어요.");
      return;
    }
    const readyKey = `ready_${materialId}`;
    const prepared = Math.min(state.upgrades.knife ? 2 : 1, state.stock[materialId], needs.fruitNeeds[materialId] - state.stock[readyKey]);
    state.stock[materialId] -= prepared;
    state.stock[readyKey] += prepared;
    selectedMaterial = null;
    renderAll();
    const preparedTotal = Object.keys(needs.fruitNeeds).reduce((sum, id) => sum + state.stock[`ready_${id}`], 0);
    const requiredTotal = Object.values(needs.fruitNeeds).reduce((sum, amount) => sum + amount, 0);
    if (preparedTotal >= requiredTotal) showToast("오늘 주문 과일 손질 완료! 빠진 재료를 확인하고 영업을 시작하세요.");
    else showToast(`${fruit.name} ${prepared}개 손질 완료 · 남은 과일 ${requiredTotal - preparedTotal}개를 준비하세요.`);
    return;
  }

  if (target !== "recipe-stage" || state.phase !== "open" || !state.customer || !state.orderAccepted) return;
  const plan = recipePlanFor(state.customer);
  if (state.recipeStep >= plan.length) return;
  const expected = plan[state.recipeStep];
  if (materialId !== expected) {
    state.customer.wait += 4;
    selectedMaterial = null;
    renderWorkbench();
    updateLiveCustomerUI();
    showToast("재료 순서가 틀렸어요! 손님 인내심 -4초");
    return;
  }
  if (availableStock(materialId) <= 0) {
    showToast("재료가 부족해요. 재료상에서 먼저 구매하세요.");
    return;
  }
  state.stock[materialId] -= 1;
  state.recipeStep += 1;
  selectedMaterial = null;
  renderAll();
  if (state.recipeStep >= plan.length) showToast("보자기 포장 완료! 손님에게 전달하고 POS에서 결제하세요.");
}

function getPersonNode(customer, active) {
  let card = customerNodes.get(customer.id);
  if (!card) {
    card = makePerson(customer);
    customerNodes.set(customer.id, card);
  }
  updatePerson(card, customer, active);
  return card;
}

function updateLiveCustomerUI() {
  for (const customer of [state.customer, ...state.queue.slice(0, 4)]) {
    if (!customer) continue;
    const node = customerNodes.get(customer.id);
    if (node) updatePerson(node, customer, customer === state.customer);
  }
  if (state.customer && state.phase === "open") {
    const patience = customerPatience(state.customer);
    const ratio = Math.min(1, state.customer.wait / patience);
    const fill = $("order-card").querySelector(".wait-track i");
    if (fill) fill.style.width = `${100 * (1 - ratio)}%`;
    const caption = $("order-card").querySelector(".wait-caption");
    if (caption) {
      const moodLabel = ratio >= .72 ? "손님이 화가 났어요!" : ratio >= .42 ? "조금씩 지루해해요" : "기다리는 시간";
      const remaining = `${Math.max(0, Math.ceil(patience - state.customer.wait))}초`;
      if (caption.firstElementChild.textContent !== moodLabel) caption.firstElementChild.textContent = moodLabel;
      if (caption.lastElementChild.textContent !== remaining) caption.lastElementChild.textContent = remaining;
    }
  }
  const completed = state.served + state.left;
  const total = state.phase === "open" ? state.queue.length + Number(Boolean(state.customer)) + completed : state.phase === "prep" ? customerCountForDay() : completed;
  $("today-count").textContent = `${completed} / ${total}명`;
  $("day-progress").style.width = `${total ? Math.min(100, completed / total * 100) : 0}%`;
  $("queue-count").textContent = `대기 ${state.queue.length}명`;
}

function renderOrderCard() {
  const card = $("order-card");
  card.replaceChildren();
  const heading = makeElement("div", "section-heading");
  heading.append(makeElement("strong", "", state.customer && state.phase === "open" ? "현재 주문" : "손님 안내"));
  heading.append(makeElement("span", "", state.customer && state.phase === "open" ? "COUNTER" : "TODAY"));
  card.append(heading);

  if (state.customer && state.phase === "open") {
    const customer = state.customer;
    const row = makeElement("div", "order-person");
    row.append(makeElement("div", "mini-portrait", customer.icon));
    const copy = makeElement("div", "order-copy");
    copy.append(makeElement("strong", "", customer.name), makeElement("span", "", customer.order), makeElement("small", "", `${customer.detail} · ${won(customer.price)}`));
    row.append(copy);
    card.append(row);
    const track = makeElement("div", "wait-track");
    const fill = document.createElement("i");
    fill.style.width = `${Math.max(0, 100 * (1 - customer.wait / customerPatience(customer)))}%`;
    track.append(fill);
    const caption = makeElement("div", "wait-caption");
    caption.append(makeElement("span", "", customer.wait > customerPatience(customer) * .72 ? "화가 나기 직전이에요" : "기다리는 시간"), makeElement("span", "", `${Math.max(0, Math.ceil(customerPatience(customer) - customer.wait))}초`));
    card.append(track, caption);
  } else {
    const messages = {
      prep: "아침 준비를 마치고 손님을 맞이해 보세요.",
      cleaning: "카운터를 정리하면 오늘의 결과를 확인할 수 있어요.",
      report: "오늘 하루의 매출과 평판을 확인하세요."
    };
    card.append(makeElement("div", "order-empty", messages[state.phase] || "차분히 다음 손님을 기다려요."));
  }
}

function startDay() {
  if (state.phase !== "prep") return;
  if (!stockReadyForDay()) {
    showToast(`아직 영업 준비가 끝나지 않았어요. ${missingStockSummary().join(" · ")}`);
    return;
  }
  state.phase = "open";
  const count = customerCountForDay();
  state.queue = dayOrderPlan().map((customer, index) => ({
    ...customer,
    id: `${state.day}-${index}`,
    patience: Math.max(40, Math.round(customer.patience * Math.max(.62, 1 - (state.day - 1) * .05))),
    wait: 0
  }));
  state.served = 0;
  state.left = 0;
  state.sales = 0;
  state.customer = state.queue.shift() || null;
  state.orderAccepted = false;
  state.recipeStep = 0;
  state.customer.wait = 0;
  lastTick = performance.now();
  renderAll();
  showToast(`영업 시작! 오늘의 손님 ${count}명 · 빠른 응대로 평판을 지켜요.`);
}

function showOrderModal() {
  if (!state.customer || state.orderAccepted) return;
  const customer = state.customer;
  const content = makeElement("div", "order-detail");
  content.append(makeElement("div", "mini-portrait", customer.icon));
  const copy = makeElement("div", "order-detail-copy");
  copy.append(makeElement("strong", "", customer.name), makeElement("span", "", customer.order), makeElement("small", "", customer.detail));
  content.append(copy);
  openModal("손님의 주문을 받았어요", "제조를 시작하면 기다리는 시간도 계속 흐릅니다.", content, [
    { label: "주문 접수하기", action: () => {
      state.orderAccepted = true;
      state.recipeStep = 0;
      closeModal();
      renderAll();
      showToast("주문 접수 완료! 서둘러 떡을 빚어 주세요.");
    } },
    { label: "다시 보기", kind: "secondary", action: closeModal }
  ], "COUNTER · ORDER");
}

function nextCustomer() {
  state.customer = state.queue.shift() || null;
  if (state.customer) {
    state.customer.wait = 0;
    state.orderAccepted = false;
    state.recipeStep = 0;
  }
  renderAll();
}

function completeSale() {
  if (!state.customer || !state.orderAccepted || state.recipeStep < recipePlanFor(state.customer).length) return;
  const sold = state.customer;
  const ratio = sold.wait / customerPatience(sold);
  state.sales += sold.price;
  state.money += sold.price;
  state.served += 1;
  state.reputation = Math.min(100, state.reputation + (ratio < .35 ? 2 : ratio < .7 ? 1 : 0));
  nextCustomer();
  showToast(`${sold.name} 결제 완료 · ${won(sold.price)}`);
}

function startCleaning() {
  state.phase = "cleaning";
  state.cleaning = 0;
  renderAll();
  openCleaningModal();
}

function openCleaningModal() {
  const content = makeElement("div", "recipe-game");
  content.append(makeElement("div", "cleaning-sparkle", "✧"));
  content.append(makeElement("strong", "recipe-step-label", `카운터 청소 ${state.cleaning} / 3`));
  content.append(makeElement("p", "mini-caption", "먼지와 설탕가루를 깨끗하게 닦아 마감하세요."));
  openModal("마감 청소", "청소를 세 번 완료하면 오늘의 영업 결과를 정산합니다.", content, [
    { label: "깨끗하게 닦기", action: () => {
      state.cleaning += 1;
      if (state.cleaning >= 3) {
        state.phase = "report";
        state.reputation = Math.min(100, state.reputation + Math.min(3, Math.floor(state.served / 2)));
        renderAll();
        closeModal();
        showReceipt();
      } else {
        renderAll();
        openCleaningModal();
      }
    } },
    { label: "계속 영업장 보기", kind: "secondary", action: closeModal }
  ], "CLOSING · CLEAN UP");
}

function readRankingStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(RANKING_KEY) || "[]");
    if (Array.isArray(saved)) {
      const entries = saved.filter((row) => typeof row.name === "string" &&
        Number.isFinite(row.score) && Number.isFinite(row.sales) && Number.isFinite(row.timestamp));
      return { entries, submitted: entries.slice().sort((a, b) => b.timestamp - a.timestamp)[0] || null };
    }
    if (!saved || !Array.isArray(saved.entries)) throw new TypeError("랭킹 데이터 형식이 올바르지 않습니다.");
    return {
      entries: saved.entries.filter((row) => typeof row.name === "string" && Number.isFinite(row.score) && Number.isFinite(row.sales) && Number.isFinite(row.timestamp)),
      submitted: saved.submitted && typeof saved.submitted.name === "string" ? saved.submitted : null
    };
  } catch (error) {
    console.error("로컬 랭킹을 불러오지 못했습니다:", error);
    return { entries: [], submitted: null };
  }
}

function getRankings() {
  return readRankingStore().entries
      .sort((a, b) => b.score - a.score || b.sales - a.sales || a.timestamp - b.timestamp).slice(0, 5);
}

function drawRankings(rows) {
  const table = makeElement("table", "ranking-table");
  const head = document.createElement("thead");
  const heading = document.createElement("tr");
  ["순위", "사장님", "매출", "점수"].forEach((value) => heading.append(makeElement("th", "", value)));
  head.append(heading);
  const body = document.createElement("tbody");
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = makeElement("td", "", "아직 기록이 없어요. 첫 랭킹을 등록해 보세요!");
    cell.colSpan = 4;
    row.append(cell);
    body.append(row);
  }
  rows.forEach((entry, index) => {
    const row = document.createElement("tr");
    [`${index + 1}`, entry.name, won(entry.sales), entry.score.toLocaleString("ko-KR")].forEach((value) => row.append(makeElement("td", "", value)));
    body.append(row);
  });
  table.append(head, body);
  return table;
}

function drawUpgrades() {
  const list = makeElement("div", "upgrade-list");
  upgrades.forEach((upgrade) => {
    const level = state.upgrades[upgrade.id];
    const maxLevel = upgrade.id === "chairs" ? 3 : 1;
    const price = upgrade.id === "chairs" ? upgrade.price * (1 + level * .5) : upgrade.price;
    const card = makeElement("article", "upgrade-card");
    card.append(makeElement("span", "upgrade-icon", upgrade.icon));
    const copy = makeElement("span", "upgrade-copy");
    copy.append(makeElement("strong", "", `${upgrade.name}${level ? ` Lv.${level}` : ""}`));
    copy.append(makeElement("small", "", level >= maxLevel ? "최고 레벨" : upgrade.description));
    const buy = makeElement("button", "ui-button secondary", level >= maxLevel ? "구매 완료" : won(price));
    buy.type = "button";
    buy.disabled = level >= maxLevel || state.money < price;
    buy.addEventListener("click", () => {
      if (level >= maxLevel || state.money < price) return;
      state.money -= price;
      state.upgrades[upgrade.id] += 1;
      $("wallet-label").textContent = `보유금 ${won(state.money)}`;
      $("upgrade-list").replaceChildren(drawUpgrades());
      renderAll();
      showToast(`${upgrade.name} 업그레이드를 구매했어요.`);
    });
    card.append(copy, buy);
    list.append(card);
  });
  return list;
}

function makeRankingForm() {
  const form = makeElement("form", "ranking-form");
  const label = makeElement("label", "", "오늘의 사장님 이름");
  label.htmlFor = "ranking-name";
  const row = makeElement("div", "ranking-input-row");
  const input = document.createElement("input");
  input.id = "ranking-name";
  input.maxLength = 20;
  input.required = true;
  input.placeholder = "이름을 입력해 주세요";
  input.autocomplete = "nickname";
  const submit = makeElement("button", "ui-button secondary", "랭킹 등록");
  submit.type = "submit";
  const priorSubmission = readRankingStore().submitted;
  const status = makeElement("p", "ranking-status", priorSubmission
    ? `${priorSubmission.name} 이름으로 이미 등록했어요. 이 브라우저에서는 랭킹을 다시 등록할 수 없습니다.`
    : "매출과 평판을 합산해 TOP 5에 도전해요. 순위는 이 브라우저에만 저장되며, 이름은 한 번만 등록할 수 있어요.");
  if (priorSubmission) {
    input.value = priorSubmission.name;
    input.disabled = true;
    submit.disabled = true;
    state.rankSaved = true;
  }
  row.append(input, submit);
  form.append(label, row, status);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) {
      input.focus();
      return;
    }
    const store = readRankingStore();
    if (store.submitted) {
      state.rankSaved = true;
      input.disabled = true;
      submit.disabled = true;
      status.textContent = `${store.submitted.name} 이름으로 이미 등록했어요.`;
      $("next-day-button").disabled = false;
      return;
    }
    const score = state.sales + state.reputation * 100;
    const entry = { name, day: state.day, sales: state.sales, reputation: state.reputation, score, timestamp: Date.now() };
    try {
      const saved = [...store.entries, entry].sort((a, b) => b.score - a.score || b.sales - a.sales || a.timestamp - b.timestamp).slice(0, 5);
      localStorage.setItem(RANKING_KEY, JSON.stringify({ entries: saved, submitted: entry }));
      state.rankSaved = true;
      input.disabled = true;
      submit.disabled = true;
      status.textContent = saved.some((item) => item.timestamp === entry.timestamp)
        ? `등록 완료! ${score.toLocaleString("ko-KR")}점으로 TOP 5에 기록됐어요.`
        : "기록을 저장했어요. 다음 영업도 도전해 보세요!";
      $("rank-table-wrap").replaceChildren(drawRankings(saved));
      $("next-day-button").disabled = false;
      showToast("오늘의 기록을 이 기기의 랭킹에 저장했어요.");
    } catch (error) {
      console.error("로컬 랭킹 저장 실패:", error);
      status.textContent = "랭킹을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.";
    }
  });
  return form;
}

function showReceipt() {
  state.rankSaved = Boolean(readRankingStore().submitted);
  const content = makeElement("div", "report-content");
  const receipt = makeElement("div", "receipt");
  receipt.append(makeElement("h3", "", `DAY ${String(state.day).padStart(2, "0")} · 영업 정산`));
  receipt.append(makeElement("div", "receipt-row", `판매 매출　${won(state.sales)}`));
  receipt.append(makeElement("div", "receipt-row", `응대 ${state.served}명 · 이탈 ${state.left}명`));
  receipt.append(makeElement("div", "receipt-row", `오늘의 평판　${state.reputation}점`));
  receipt.append(makeElement("div", "receipt-total", `보유금　${won(state.money)}`));
  const tableWrap = makeElement("div");
  tableWrap.id = "rank-table-wrap";
  tableWrap.append(drawRankings(getRankings()));
  const title = makeElement("h3", "report-subtitle", "우리 가게 랭킹 TOP 5");
  const wallet = makeElement("p", "wallet", `보유금 ${won(state.money)}`);
  wallet.id = "wallet-label";
  const list = drawUpgrades();
  list.id = "upgrade-list";
  content.append(receipt, title, makeRankingForm(), tableWrap, makeElement("h3", "report-subtitle", "가게 업그레이드"), wallet, list);
  openModal("오늘 하루도 수고했어요!", "정산을 확인하고 랭킹에 이름을 남기면 다음 날 영업을 시작할 수 있어요.", content, [
    { label: state.rankSaved ? "다음 날 영업 시작" : "랭킹 등록 후 다음 날", action: () => {
      if (!state.rankSaved) {
        $("ranking-name")?.focus();
        return;
      }
      nextDay();
    }, disabled: true }
  ], "A DAY WELL SPENT · RECEIPT");
  $("modal-actions").querySelector("button").id = "next-day-button";
}

function nextDay() {
  if (!state.rankSaved) return;
  state.day += 1;
  state.phase = "prep";
  state.queue = [];
  state.customer = null;
  state.orderAccepted = false;
  state.recipeStep = 0;
  state.cleaning = 0;
  state.served = 0;
  state.left = 0;
  state.sales = 0;
  closeModal();
  renderAll();
  showToast(`DAY ${String(state.day).padStart(2, "0")} · 새로운 하루가 시작돼요.`);
}

function renderActionCard() {
  const card = $("action-card");
  card.replaceChildren();
  const heading = makeElement("div", "section-heading");
  heading.append(makeElement("strong", "", "오늘의 작업"));
  heading.append(makeElement("span", "", ({ prep: "01 · 준비", open: "02 · 영업", cleaning: "03 · 마감", report: "완료" })[state.phase]));
  card.append(heading);
  const title = makeElement("h2", "action-title");
  const description = makeElement("p", "action-description");
  const button = makeElement("button", "ui-button primary action-button");
  button.type = "button";
  card.append(title, description, button);

  if (state.phase === "prep") {
    if (stockReadyForDay()) {
      title.textContent = "재료 준비 완료";
      description.textContent = `오늘 쓸 재료를 모두 확보했어요. 남은 현금 ${won(state.money)} · 이제 문을 여세요.`;
      button.textContent = "가게 문 열기";
      button.dataset.action = "open-shop";
    } else {
      title.textContent = "재료 구매와 손질";
      description.textContent = `재료상에서 오늘 필요한 재료를 직접 사고 과일 ${dayRequirements().portions}개를 손질해야 문을 열 수 있어요.`;
      button.textContent = "재료상으로 이동";
      button.dataset.action = "go-supplies";
    }
  } else if (state.phase === "open" && state.customer) {
    if (!state.orderAccepted) {
      title.textContent = "손님 주문 받기";
      description.textContent = `${state.customer.name} 손님이 카운터에서 기다리고 있어요.`;
      button.textContent = "주문 확인하기";
      button.dataset.action = "accept";
    } else if (state.recipeStep < recipePlanFor(state.customer).length) {
      const plan = recipePlanFor(state.customer);
      title.textContent = "주방에서 떡 빚기";
      description.textContent = `작업대의 재료를 다음 재료 표시에 맞춰 직접 드래그하세요. ${state.recipeStep} / ${plan.length} 단계 완료`;
      button.hidden = true;
    } else {
      title.textContent = "주문 완성 · 결제 대기";
      description.textContent = "완성한 떡을 손님에게 전달하고 결제를 마무리하세요.";
      button.textContent = `POS 결제 · ${won(state.customer.price)}`;
      button.dataset.action = "pay";
    }
  } else if (state.phase === "open") {
    title.textContent = "오늘의 주문을 마쳤어요";
    description.textContent = "카운터를 정리하고 영업을 마감하세요.";
    button.textContent = "마감 청소 시작";
    button.dataset.action = "close-day";
  } else if (state.phase === "cleaning") {
    title.textContent = "마감 청소";
    description.textContent = `카운터와 작업대를 닦아 주세요. (${state.cleaning} / 3)`;
    button.textContent = "청소 이어 하기";
    button.dataset.action = "clean";
  } else {
    title.textContent = "오늘 정산 완료";
    description.textContent = "정산 창에서 랭킹을 등록하고 다음 날을 준비하세요.";
    button.textContent = "정산 다시 보기";
    button.dataset.action = "report";
  }
}

function renderAll() {
  renderHud();
  renderScene();
  renderOrderCard();
  renderSupplyShop();
  renderWorkbench();
  renderActionCard();
}

function actionClick(action) {
  if (action === "open-shop") startDay();
  if (action === "accept") showOrderModal();
  if (action === "go-supplies") $("supply-card").scrollIntoView({ behavior: "smooth", block: "center" });
  if (action === "pay") completeSale();
  if (action === "close-day") startCleaning();
  if (action === "clean") openCleaningModal();
  if (action === "report") showReceipt();
}

const tutorialSteps = [
  {
    title: "오늘 장사에 필요한 수량부터 확인",
    text: "DAY 1에는 떡 5개와 보자기 3개가 필요해요. 시작 자금은 넉넉하지 않으니 필요한 만큼만 사고, 매출을 남겨 다음 날 재료를 마련하세요."
  },
  {
    title: "재료상에서 직접 발주",
    text: "재료상에서 찹쌀떡 피·팥소·요거트 소·주문에 맞는 과일·보자기를 +1 또는 +3 단위로 구매합니다. 잔액과 오늘의 예상 소요량을 확인하고 계획적으로 주문하세요."
  },
  {
    title: "생딸기를 손질판에 드래그",
    text: "오늘 주문에 맞춰 딸기·망고·청포도·복숭아·키위를 사고, 해당 과일 재료를 작업대 손질판 위로 끌어 놓으세요. 요거트 소를 선택한 손님도 있으니 필요한 소를 확인하세요."
  },
  {
    title: "재료를 순서대로 끌어 떡 빚기",
    text: "손님 주문을 받은 뒤 떡피 → 주문된 팥소 또는 요거트 소 → 해당 손질 과일 순으로 작업판에 놓으세요. 2개 주문은 이 과정을 두 번 반복하고, 마지막에 보자기를 묶습니다."
  },
  {
    title: "시간을 지켜 결제와 정산",
    text: "틀린 재료를 놓으면 인내심이 4초 줄고, 오래 기다린 손님은 떠납니다. 완성 후 POS 결제, 마감 청소, 정산을 진행하세요. 남은 재료는 다음 날로 이어집니다."
  }
];

function tutorialWasCompleted() {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === "done";
  } catch (error) {
    console.error("튜토리얼 설정을 확인하지 못했습니다:", error);
    return false;
  }
}

function completeTutorial() {
  try {
    localStorage.setItem(TUTORIAL_KEY, "done");
  } catch (error) {
    console.error("튜토리얼 설정을 저장하지 못했습니다:", error);
  }
  closeModal();
}

function showTutorial() {
  tutorialIndex = 0;
  renderTutorialStep();
}

function renderTutorialStep() {
  const step = tutorialSteps[tutorialIndex];
  const content = makeElement("div", "tutorial-content");
  const progress = makeElement("div", "tutorial-progress");
  progress.append(makeElement("span", "", `안내 ${tutorialIndex + 1} / ${tutorialSteps.length}`));
  const meter = makeElement("i");
  meter.style.width = `${(tutorialIndex + 1) / tutorialSteps.length * 100}%`;
  progress.append(meter);
  content.append(progress, makeElement("h3", "tutorial-step-title", step.title), makeElement("p", "tutorial-step-copy", step.text));
  const actions = [];
  if (tutorialIndex > 0) {
    actions.push({ label: "이전", kind: "secondary", action: () => { tutorialIndex -= 1; renderTutorialStep(); } });
  }
  if (tutorialIndex < tutorialSteps.length - 1) {
    actions.push({ label: "다음 안내", action: () => { tutorialIndex += 1; renderTutorialStep(); } });
  } else {
    actions.push({ label: "가게 시작하기", action: completeTutorial });
  }
  actions.push({ label: "건너뛰기", kind: "secondary", action: completeTutorial });
  openModal("처음 오셨나요?", "재료 구매부터 드래그 제조까지 한 번에 안내해 드릴게요.", content, actions, "TUTORIAL · SHOP OWNER");
}

function updateWaitTimes() {
  const now = performance.now();
  const delta = Math.min((now - lastTick) / 1000, 1);
  lastTick = now;
  if (state.phase !== "open") return;
  let stateChanged = false;
  state.queue.forEach((customer) => { customer.wait += delta; });
  if (state.customer) {
    state.customer.wait += delta;
    if (state.customer.wait >= customerPatience(state.customer)) {
      const departed = state.customer;
      state.customer = null;
      state.orderAccepted = false;
      state.recipeStep = 0;
      state.left += 1;
      state.reputation = Math.max(0, state.reputation - 8);
      if (modal) closeModal();
      showToast(`${departed.name} 손님이 기다리다 돌아갔어요. 평판 -8`);
      state.customer = state.queue.shift() || null;
      if (state.customer) {
        state.customer.wait = 0;
        state.orderAccepted = false;
      }
      stateChanged = true;
    }
  }
  const departures = state.queue.filter((customer) => customer.wait >= customerPatience(customer));
  if (departures.length) {
    state.queue = state.queue.filter((customer) => !departures.includes(customer));
    state.left += departures.length;
    state.reputation = Math.max(0, state.reputation - departures.length * 5);
    showToast(`${departures.length}명의 손님이 기다리다 돌아갔어요. 평판 -${departures.length * 5}`);
    stateChanged = true;
  }
  if (stateChanged) renderAll();
  else updateLiveCustomerUI();
}

function setupInstall() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installEvent = event;
    $("install-button").hidden = false;
  });
  $("install-button").addEventListener("click", async () => {
    if (!installEvent) return;
    installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") showToast("한정선 시뮬레이터를 홈 화면에 설치했어요.");
    installEvent = null;
    $("install-button").hidden = true;
  });
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => console.error("서비스 워커 등록 실패:", error));
    }, { once: true });
  }
}

function init() {
  $("modal-close").addEventListener("click", closeModal);
  document.addEventListener("pointermove", moveMaterialDrag);
  document.addEventListener("pointerup", finishMaterialDrag);
  document.addEventListener("pointercancel", cancelMaterialDrag);
  $("interaction-modal").addEventListener("pointerdown", (event) => {
    if (event.target === $("interaction-modal")) closeModal();
  });
  $("action-card").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (button) actionClick(button.dataset.action);
  });
  $("help-button").addEventListener("click", showTutorial);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal) closeModal();
  });
  setInterval(updateWaitTimes, 250);
  setupInstall();
  renderAll();
  if (!tutorialWasCompleted()) window.setTimeout(showTutorial, 350);
}

init();
