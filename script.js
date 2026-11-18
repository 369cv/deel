'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const wrap = (index, length) => (index % length + length) % length;

// Native details elements keep the navigation usable without JavaScript.
const header = $('.site-header');
const menuToggle = $('.menu-toggle', header);
const navigation = $('.main-nav', header);
const disclosures = $$('[data-disclosure]', header);
header.dataset.enhanced = '';

function closeDisclosures(except) {
  disclosures.forEach((item) => {
    if (item !== except) item.open = false;
  });
}

function setMobileMenu(open, restoreFocus = false) {
  header.toggleAttribute('data-mobile-open', open);
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (!open) closeDisclosures();
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => setMobileMenu(!header.hasAttribute('data-mobile-open')));
for (const disclosure of disclosures) {
  disclosure.addEventListener('toggle', () => {
    if (disclosure.open) closeDisclosures(disclosure);
  });
}
navigation.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  if (header.hasAttribute('data-mobile-open')) setMobileMenu(false);
  else closeDisclosures();
});

document.addEventListener('click', (event) => {
  const current = event.target.closest('[data-disclosure]');
  closeDisclosures(current);
  if (!header.contains(event.target) && header.hasAttribute('data-mobile-open')) {
    setMobileMenu(false);
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || $('dialog[open]')) return;
  const openDisclosure = disclosures.find((item) => item.open);
  if (openDisclosure) {
    openDisclosure.open = false;
    $('summary', openDisclosure).focus();
  } else if (header.hasAttribute('data-mobile-open')) {
    setMobileMenu(false, true);
  }
});
window.matchMedia('(max-width: 1000px)').addEventListener('change', () => setMobileMenu(false));

function selectTab(currentTab, tabs) {
  for (const tab of tabs) {
    const active = tab === currentTab;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  }
}

function keyboardIndex(key, index, count) {
  if (key === 'ArrowRight') return wrap(index + 1, count);
  if (key === 'ArrowLeft') return wrap(index - 1, count);
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}

const timelineTabs = $$('.speed-tabs [role="tab"]');
for (const [index, tab] of timelineTabs.entries()) {
  tab.addEventListener('click', () => selectTab(tab, timelineTabs));
  tab.addEventListener('keydown', (event) => {
    const next = keyboardIndex(event.key, index, timelineTabs.length);
    if (next === null) return;
    event.preventDefault();
    selectTab(timelineTabs[next], timelineTabs);
    timelineTabs[next].focus();
  });
}

const features = $$('.feature-options button[aria-controls]');
for (const feature of features) {
  feature.addEventListener('click', () => {
    for (const item of features) {
      const active = item === feature;
      item.setAttribute('aria-pressed', String(active));
      item.closest('.feature-option').classList.toggle('is-active', active);
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    }
  });
}

// Both carousels are user-controlled and support dot buttons, arrow keys, and swipes.
function bindPagination(carousel, render) {
  const buttons = $$('.pagination button', carousel);
  let activeIndex = 0;
  let touchStart;

  function choose(index, focus = false) {
    const next = wrap(index, buttons.length);
    if (next !== activeIndex) {
      buttons[activeIndex].removeAttribute('aria-current');
      buttons[next].setAttribute('aria-current', 'true');
      activeIndex = next;
      render(next);
    }
    if (focus) buttons[next].focus();
  }

  for (const [index, button] of buttons.entries()) {
    button.addEventListener('click', () => choose(index));
    button.addEventListener('keydown', (event) => {
      const next = keyboardIndex(event.key, index, buttons.length);
      if (next === null) return;
      event.preventDefault();
      choose(next, true);
    });
  }

  carousel.addEventListener('touchstart', (event) => {
    touchStart = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  carousel.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  carousel.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const end = event.changedTouches[0];
    const dx = end.clientX - touchStart.clientX;
    const dy = end.clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < 1.45 * Math.abs(dy)) return;
    if (event.cancelable) event.preventDefault();
    choose(activeIndex + (dx < 0 ? 1 : -1));
  }, { passive: false });
}

const heroCarousel = $('.hero-carousel');
const heroStory = $('.hero-story', heroCarousel);
const heroQuote = $('.hero-quote p', heroStory);
const rampQuote = [...heroQuote.childNodes];
const heroQuotes = [
  { key: 'ramp', name: 'Ramp', by: 'Dave Pulito, Head of Partnerships, Ramp' },
  { key: 'robinhood', name: 'Robinhood', quote: '“Deel is a game changer.”', by: 'Shiv Verma, SVP of Finance' },
  { key: 'revolut', name: 'Revolut', quote: '“Thanks to Deel, we get to hire local talent in any country where we want to expand long before we set up the entity there.”', by: 'Luka Besling, HR Manager, Revolut' },
  { key: 'cal', name: 'Cal.com', quote: '“After discovering the platform’s ability to pay multiple people at once, we signed up immediately.”', by: 'Peer Richelsen, Co-Founder, Cal.com' },
];

bindPagination(heroCarousel, (index) => {
  const item = heroQuotes[index];
  heroStory.dataset.brand = item.key;
  $('.hero-story-photo', heroStory).hidden = index > 0;
  $('.hero-story-art', heroStory).dataset.brandName = item.name;
  $('.brand-badge-name', heroStory).textContent = item.name;
  $('.hero-attribution', heroStory).textContent = `— ${item.by}`;
  if (index === 0) heroQuote.replaceChildren(...rampQuote);
  else heroQuote.textContent = item.quote;
});

const stories = $('.stories');
const storyMedia = $('.story-media', stories);
const storyIcon = $('.story-media-icon use', storyMedia);
const storyTitle = $('#story-name', stories);
const revolutMark = storyTitle.firstElementChild;
const storyDescription = $('.story-description', stories);
const storyLink = $('.story-link', stories);
const storyPreview = $('.story-preview', stories);
const revolutVideo = storyMedia.dataset.videoId;
const customerStories = [
  { key: 'revolut', name: 'Revolut', slug: 'revolut', description: storyDescription.textContent, video: revolutVideo },
  { key: 'cocoroco', name: 'Cocoroco', slug: 'cocoroco', description: 'By embedding Deel into its platform, Cocoroco automated every hire, contract, and payment through a single, fully branded experience.' },
  { key: 'cal', name: 'Cal.com', slug: 'cal-com', description: 'From wiring money by hand to running a borderless company on one platform, see how Cal.com hires, pays, and supports its global team with Deel.' },
  { key: 'strada', name: 'Strada', slug: 'strada', description: 'Strada, a conversational AI platform for insurance brokers, uses Deel to manage US payroll, global hiring, and compliance for its growing team.' },
  { key: 'sardine', name: 'Sardine', slug: 'sardine', description: 'With Deel, Sardine can hire talent worldwide, offer competitive salaries, and optimize its capital spend.' },
  { key: 'superfiliate', name: 'Superfiliate', slug: 'superfiliate', description: 'See how Superfiliate, a growing word-of-mouth marketing platform, simplified global hiring and payroll with Deel.' },
  { key: 'bowmans', name: 'Bowmans', slug: 'bowmans', description: 'Bowmans adopted Deel Local Payroll to unify payroll operations across six jurisdictions in a complex, multi-country landscape.' },
];

bindPagination(stories, (index) => {
  const { key, name, slug, video, description } = customerStories[index];
  const caseStudy = `https://www.deel.com/case-studies/${slug}/`;
  storyMedia.dataset.story = key;
  storyMedia.href = video ? `https://www.youtube.com/watch?v=${video}` : caseStudy;
  storyMedia.setAttribute('aria-label', video ? `Play ${name}'s customer story` : `Read ${name}'s customer story`);
  if (video) storyMedia.dataset.videoId = video;
  else delete storyMedia.dataset.videoId;
  $('.story-poster', storyMedia).hidden = !video;
  $('.story-art-name', storyMedia).textContent = video ? '' : name;
  storyIcon.setAttribute('href', `./assets/icons.svg#${video ? 'play' : 'right'}`);
  if (index === 0) storyTitle.replaceChildren(revolutMark);
  else storyTitle.textContent = name;
  storyDescription.textContent = description;
  storyLink.href = caseStudy;
  storyLink.setAttribute('aria-label', `Learn more about ${name}'s story`);
  $('.story-status', stories).textContent = `${name}, story ${index + 1} of ${customerStories.length}`;

  const preview = customerStories[wrap(index + 1, customerStories.length)];
  storyPreview.dataset.story = preview.key;
  $('.story-preview-image span', storyPreview).textContent = preview.name;
});

const ratings = $('.ratings');
const ratingList = $('.ratings-list', ratings);
const ratingCards = [...ratingList.children];
const narrowRatings = window.matchMedia('(max-width: 590px)');
const mediumRatings = window.matchMedia('(max-width: 850px)');
let firstRating = 0;

function renderRatings(announce = false) {
  const count = narrowRatings.matches ? 1 : mediumRatings.matches ? 2 : 4;
  const visible = Array.from({ length: count }, (_, i) => ratingCards[wrap(firstRating + i, ratingCards.length)]);
  visible.forEach((card) => { card.hidden = false; });
  ratingList.replaceChildren(...visible);
  if (announce) $('.ratings-status', ratings).textContent = `Showing reviews starting with ${$('.ratings-author', visible[0]).textContent}`;
}
ratings.dataset.enhanced = '';
renderRatings();
for (const query of [narrowRatings, mediumRatings]) query.addEventListener('change', () => renderRatings());
for (const button of $$('[data-ratings-step]', ratings)) {
  button.addEventListener('click', () => {
    firstRating = wrap(firstRating + Number(button.dataset.ratingsStep), ratingCards.length);
    renderRatings(true);
  });
}

const videoDialog = $('#video-dialog');
const videoFrame = $('.video-frame', videoDialog);
storyMedia.addEventListener('click', (event) => {
  const video = storyMedia.dataset.videoId;
  if (!video || typeof videoDialog.showModal !== 'function' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const iframe = document.createElement('iframe');
  iframe.title = `${storyTitle.textContent || revolutMark.alt} customer story video`;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video)}?autoplay=1&rel=0`;
  $('.dialog-fallback', videoDialog).href = storyMedia.href;
  videoFrame.replaceChildren(iframe);
  videoDialog.showModal();
});
videoDialog.addEventListener('close', () => videoFrame.replaceChildren());
const cookieDialog = $('#cookie-dialog');
$('[data-open-cookies]').addEventListener('click', () => cookieDialog.showModal());
for (const dialog of [videoDialog, cookieDialog]) {
  let pointerDownOnBackdrop = false;
  dialog.addEventListener('pointerdown', (event) => { pointerDownOnBackdrop = event.target === dialog; });
  dialog.addEventListener('click', (event) => {
    if (pointerDownOnBackdrop && event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    }
    pointerDownOnBackdrop = false;
  });
}

$('.newsletter').addEventListener('submit', (event) => {
  event.preventDefault();
  const status = $('.newsletter-status', event.currentTarget);
  status.hidden = false;
  $('a', status).focus();
});
