const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("#mobile-menu");

if (menuToggle && mobileMenu) {
  const menuBreakpoint = window.matchMedia("(max-width: 1150px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const background = [document.querySelector("main"), document.querySelector(".site-footer")].filter(Boolean);
  let hideTimer;
  const isOpen = () => menuToggle.getAttribute("aria-expanded") === "true";

  function setMenuOpen(open, restoreFocus = false) {
    window.clearTimeout(hideTimer);
    if (open && !menuBreakpoint.matches) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.classList.toggle("menu-open", open);
    background.forEach((element) => { element.inert = open; });

    if (open) {
      mobileMenu.hidden = false;
      mobileMenu.inert = false;
      mobileMenu.getBoundingClientRect();
      requestAnimationFrame(() => {
        if (isOpen()) mobileMenu.classList.add("is-open");
      });
      mobileMenu.querySelector(".mobile-menu-nav a")?.focus({ preventScroll: true });
    } else {
      mobileMenu.classList.remove("is-open");
      mobileMenu.inert = true;
      if (reduceMotion.matches) mobileMenu.hidden = true;
      else hideTimer = window.setTimeout(() => {
        if (!isOpen()) mobileMenu.hidden = true;
      }, 220);
      if (restoreFocus) menuToggle.focus({ preventScroll: true });
    }
  }

  menuToggle.addEventListener("click", () => setMenuOpen(!isOpen()));
  mobileMenu.querySelectorAll("a, [data-open-lead]").forEach((control) => {
    control.addEventListener("click", () => setMenuOpen(false));
  });
  document.addEventListener("pointerdown", (event) => {
    if (isOpen() && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      event.preventDefault();
      setMenuOpen(false, true);
    }
  });
  menuBreakpoint.addEventListener("change", () => setMenuOpen(false));
}

const projectDrawer = document.querySelector("[data-project-drawer]");
if (projectDrawer) {
  const toggle = projectDrawer.querySelector("[data-project-drawer-toggle]");
  const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceDrawerMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const setOpen = (open) => {
    if (projectDrawer.classList.contains("is-open") === open) return;
    const startHeight = parseFloat(getComputedStyle(projectDrawer).height);
    projectDrawer.style.height = `${startHeight}px`;
    projectDrawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (reduceDrawerMotion.matches) {
      projectDrawer.style.removeProperty("height");
      return;
    }
    let endHeight = 250;
    if (open) {
      projectDrawer.style.height = "auto";
      endHeight = parseFloat(getComputedStyle(projectDrawer).height);
    }
    projectDrawer.style.height = `${startHeight}px`;
    projectDrawer.getBoundingClientRect();
    projectDrawer.style.height = `${endHeight}px`;
  };

  projectDrawer.addEventListener("transitionend", (event) => {
    if (event.target === projectDrawer && event.propertyName === "height") {
      projectDrawer.style.removeProperty("height");
    }
  });

  projectDrawer.addEventListener("pointerenter", () => {
    if (hoverCapable.matches) setOpen(true);
  });
  projectDrawer.addEventListener("pointerleave", () => {
    if (hoverCapable.matches) setOpen(false);
  });
  toggle.addEventListener("click", (event) => {
    if (!hoverCapable.matches || event.detail === 0) setOpen(!projectDrawer.classList.contains("is-open"));
  });
  document.addEventListener("pointerdown", (event) => {
    if (!projectDrawer.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectDrawer.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

const dialog = document.querySelector("#lead-dialog");
const successDialog = document.querySelector("#success-dialog");
const modalHost = dialog?.querySelector("[data-modal-host]");
const inlinePanel = document.querySelector("[data-inline-panel]");

if (dialog && modalHost && inlinePanel) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let closeTimer;
  let isClosing = false;
  const modalPanel = inlinePanel.cloneNode(true);
  modalPanel.removeAttribute("data-inline-panel");
  modalPanel.querySelector("#apply-title")?.removeAttribute("id");
  modalHost.append(modalPanel);

  document.querySelectorAll("[data-open-lead]").forEach((button) => button.addEventListener("click", () => {
    window.clearTimeout(closeTimer);
    isClosing = false;
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    document.body.classList.add("modal-open");
    dialog.getBoundingClientRect();
    requestAnimationFrame(() => dialog.classList.add("is-visible"));
    dialog.querySelector('input[name="name"]').focus();
  }));

  function closeDialog() {
    if (!dialog.open || isClosing) return;
    isClosing = true;
    dialog.classList.remove("is-visible");
    document.body.classList.remove("modal-open");
    const finish = () => {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      isClosing = false;
    };
    if (reduceMotion.matches) finish();
    else closeTimer = window.setTimeout(finish, 280);
  }

  dialog.querySelector("[data-close-lead]").addEventListener("click", closeDialog);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open && !successDialog?.open) {
      event.preventDefault();
      closeDialog();
    }
  });
  dialog.addEventListener("close", () => {
    window.clearTimeout(closeTimer);
    dialog.classList.remove("is-visible");
    document.body.classList.remove("modal-open");
    isClosing = false;
  });
}

function showLeadSuccess() {
  if (!successDialog) return;
  if (typeof successDialog.showModal === "function") successDialog.showModal();
  else successDialog.setAttribute("open", "");
  document.body.classList.add("modal-open");
  successDialog.getBoundingClientRect();
  requestAnimationFrame(() => successDialog.classList.add("is-visible"));
  successDialog.querySelector("[data-close-success]").focus();
}

if (successDialog) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let closeTimer;
  function closeSuccessDialog() {
    if (!successDialog.open) return;
    successDialog.classList.remove("is-visible");
    const finish = () => {
      if (typeof successDialog.close === "function") successDialog.close();
      else successDialog.removeAttribute("open");
    };
    if (reduceMotion.matches) finish();
    else closeTimer = window.setTimeout(finish, 280);
  }
  successDialog.querySelectorAll("[data-close-success]").forEach((button) => button.addEventListener("click", closeSuccessDialog));
  successDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeSuccessDialog();
  });
  successDialog.addEventListener("close", () => {
    window.clearTimeout(closeTimer);
    successDialog.classList.remove("is-visible");
    if (!dialog?.open) document.body.classList.remove("modal-open");
  });
}

document.querySelectorAll("[data-concern-select]").forEach((root) => {
  const select = root.querySelector("select");
  const trigger = root.querySelector(".concern-trigger");
  const valueLabel = root.querySelector("[data-concern-value]");
  const menu = root.querySelector(".concern-menu");
  const options = [...menu.querySelectorAll('[role="option"]')];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let hideTimer;
  const isOpen = () => trigger.getAttribute("aria-expanded") === "true";

  const sync = () => {
    valueLabel.textContent = select.selectedOptions[0].textContent;
    trigger.classList.toggle("is-placeholder", select.value === "unspecified");
    trigger.setAttribute("aria-label", `Что тревожит больше всего? ${valueLabel.textContent}`);
    options.forEach((option) => option.setAttribute("aria-selected", String(option.dataset.value === select.value)));
  };
  const setOpen = (open) => {
    window.clearTimeout(hideTimer);
    trigger.setAttribute("aria-expanded", String(open));
    if (open) {
      menu.hidden = false;
      menu.getBoundingClientRect();
      requestAnimationFrame(() => {
        if (isOpen()) menu.classList.add("is-open");
      });
    } else {
      menu.classList.remove("is-open");
      if (reduceMotion.matches) menu.hidden = true;
      else hideTimer = window.setTimeout(() => {
        if (!isOpen()) menu.hidden = true;
      }, 220);
    }
  };

  trigger.addEventListener("click", () => setOpen(!isOpen()));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      (event.key === "ArrowDown" ? options[0] : options[options.length - 1]).focus();
    }
    if (event.key === "Escape" && isOpen()) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  });
  options.forEach((option, index) => {
    option.addEventListener("click", () => {
      select.value = option.dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
      setOpen(false);
      trigger.focus();
    });
    option.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        options[(index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length].focus();
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        (event.key === "Home" ? options[0] : options[options.length - 1]).focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        trigger.focus();
      } else if (event.key === "Tab") {
        setOpen(false);
      }
    });
  });
  document.addEventListener("pointerdown", (event) => {
    if (!root.contains(event.target)) setOpen(false);
  });
  root.closest("form").addEventListener("reset", () => requestAnimationFrame(sync));
  sync();
});

function bindLeadForm(form) {
  const status = form.querySelector("[data-form-status]");
  const phoneField = form.elements.phone;

  function setStatus(message, success = false) {
    status.textContent = message;
    status.classList.toggle("success", success);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus("");
    phoneField.removeAttribute("aria-invalid");

    const name = form.elements.name.value.trim();
    const phone = phoneField.value.trim();
    const phoneDigits = phone.replace(/\D/g, "");
    const consent = form.elements.consent.checked;

    if (name && name.length < 2) {
      setStatus("Укажите имя полностью или оставьте поле пустым.");
      form.elements.name.focus();
      return;
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setStatus("Неверно указан номер телефона");
      phoneField.setAttribute("aria-invalid", "true");
      phoneField.focus();
      return;
    }
    if (!consent) {
      setStatus("Подтвердите согласие с политикой конфиденциальности и условиями обработки данных.");
      form.elements.consent.focus();
      return;
    }

    form.reset();
    showLeadSuccess();
  });
}

document.querySelectorAll("[data-lead-form]").forEach(bindLeadForm);

const faqDetails = [...document.querySelectorAll(".faq-list details")];
faqDetails.forEach((current) => {
  current.addEventListener("toggle", () => {
    if (!current.open) return;
    faqDetails.forEach((other) => {
      if (other !== current) other.open = false;
    });
  });
});

document.querySelectorAll(".specialist-detail-toggle").forEach((button) => {
  const card = button.closest(".specialist-photo");
  const details = card.querySelector(".specialist-details");
  button.classList.add("swiper-no-swiping");
  details.classList.add("swiper-no-swiping");
  button.addEventListener("click", () => {
    const shouldOpen = !card.classList.contains("is-open");
    document.querySelectorAll(".specialist-photo.is-open").forEach((openCard) => {
      openCard.classList.remove("is-open");
      openCard.querySelector(".specialist-detail-toggle")?.setAttribute("aria-expanded", "false");
    });
    card.classList.toggle("is-open", shouldOpen);
    button.setAttribute("aria-expanded", String(shouldOpen));
  });
  details.addEventListener("click", () => {
    card.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const track = slider.querySelector("[data-slider-track]");
  const prev = slider.querySelector("[data-slider-prev]");
  const next = slider.querySelector("[data-slider-next]");
  if (!track || typeof Swiper === "undefined") return;

  const updateButtons = (swiper) => {
    prev.disabled = swiper.isBeginning;
    next.disabled = swiper.isEnd;
    const subject = slider.dataset.slider === "team" ? "специалист" : "отзыв";
    prev.setAttribute("aria-label", `Предыдущий ${subject}`);
    next.setAttribute("aria-label", `Следующий ${subject}`);
  };

  new Swiper(track, {
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 16,
    speed: 550,
    watchOverflow: true,
    navigation: { prevEl: prev, nextEl: next },
    breakpoints: {
      781: { slidesPerView: 2, spaceBetween: 24 },
    },
    on: {
      init: updateButtons,
      slideChange: updateButtons,
      resize: updateButtons,
    },
  });
});

const animatedTitle = document.querySelector(".context-outro-title");
if (animatedTitle && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const textNodes = [];
  const walker = document.createTreeWalker(animatedTitle, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  let wordIndex = 0;
  let highlightTimed = false;

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const parts = textNode.textContent.match(/\S+|\s+/gu) || [];
    parts.forEach((part) => {
      if (/^\s+$/u.test(part)) {
        fragment.append(document.createTextNode(part));
        return;
      }
      if (!highlightTimed && textNode.parentElement?.classList.contains("context-outro-highlight")) {
        textNode.parentElement.style.setProperty("--highlight-index", wordIndex);
        highlightTimed = true;
      }
      const word = document.createElement("span");
      word.className = "reveal-word";
      word.style.setProperty("--word-index", wordIndex++);
      word.textContent = part;
      fragment.append(word);
    });
    textNode.replaceWith(fragment);
  });

  animatedTitle.classList.add("reveal-ready");

  if ("IntersectionObserver" in window) {
    const titleObserver = new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;
      animatedTitle.classList.add("reveal-visible");
      observer.disconnect();
    }, { threshold: 0.2 });
    titleObserver.observe(animatedTitle);
  } else {
    animatedTitle.classList.add("reveal-visible");
  }
}

const processSteps = document.querySelector(".process-steps");
if (processSteps) {
  const markers = processSteps.querySelectorAll(".step-number");
  if (markers.length > 1) {
    let progressFrame = 0;
    const updateLineProgress = () => {
      progressFrame = 0;
      const first = markers[0].getBoundingClientRect();
      const last = markers[markers.length - 1].getBoundingClientRect();
      const stepsRect = processSteps.getBoundingClientRect();
      const scaleX = stepsRect.width / processSteps.offsetWidth;
      const scaleY = stepsRect.height / processSteps.offsetHeight;
      const scrollGuide = window.innerHeight / 2;
      const progress = Math.max(0, Math.min(1, (scrollGuide - stepsRect.top) / stepsRect.height));
      processSteps.style.setProperty("--line-top", `${(first.bottom - stepsRect.top) / scaleY}px`);
      processSteps.style.setProperty("--line-left", `${(first.left + first.width / 2 - stepsRect.left) / scaleX - 1}px`);
      processSteps.style.setProperty("--line-height", `${(last.top - first.bottom) / scaleY}px`);
      processSteps.style.setProperty("--line-progress", progress);
    };
    const queueLineProgress = () => {
      if (!progressFrame) progressFrame = requestAnimationFrame(updateLineProgress);
    };
    window.addEventListener("scroll", queueLineProgress, { passive: true });
    window.addEventListener("resize", queueLineProgress);
    queueLineProgress();
  }
}
