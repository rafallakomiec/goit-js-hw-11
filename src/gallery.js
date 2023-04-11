import 'modern-normalize/modern-normalize.css';
import { Notify } from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';
const axios = require('axios').default;
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('#load-more-btn');
const gallery = document.querySelector('.gallery');
let lightbox;

let input = '';
let currentPage = 1;
let loadedImgs = 0;
let totalImgs = 0;

form.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', loadMoreImgs);

async function onSubmit(event) {
  event.preventDefault();

  Notify.info('Processing your request! Please wait...');

  input = form.searchQuery.value;
  currentPage = 1;
  loadedImgs = 0;
  totalImgs = 0;

  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  const response = await fetchImgs(input).catch(() => {
    return;
  });

  totalImgs = response.total;
  Notify.success(`Hooray! We found ${totalImgs} images!`);

  loadImgs(response.hits);
  lightbox = new SimpleLightbox(document.querySelector('.gallery a'));
}

async function fetchImgs(query) {
  try {
    if (query.length > 100) {
      throw new Error('Please enter maximum 100 characters...');
    }
    if (query.trim() === '') {
      throw new Error('Please enter meaningful query...');
    }

    const encodedQuery = encodeURIComponent(query);

    const result = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '35303781-845e93066b0b0a407fb33e213',
        q: encodedQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: currentPage,
      },
    });

    if (result.status === 429) {
      throw new Error('Server is too busy!!! Try again in a while...');
    }

    if (result.data.hits.length === 0) {
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    if (result.status >= 200 && result.status < 300) {
      loadedImgs += 40;
      return result.data;
    } else {
      throw new Error(result.status + result.statusText);
    }
  } catch (error) {
    Notify.failure(error.message);
  }
}

function loadImgs(array) {
  for (const img of array) {
    gallery.insertAdjacentHTML(
      'beforeend',
      `<li class="gallery__card"><a class="gallery__link" href="${img.largeImageURL}">
    <img class="gallery__img" src="${img.webformatURL}" alt="${img.tags}" loading="lazy" />
    <ul class="gallery__img-info-cont">
        <li class="gallery__img-info-likes">
        <span class="img-info__title">Likes</span>${img.likes}
        </li>
        <li class="gallery__img-info-views">
        <span class="img-info__title">Views</span>${img.views}
        </li>
        <li class="gallery__img-info-comments">
        <span class="img-info__title">Comments</span>${img.comments}
        </li>
        <li class="gallery__img-info-downloads">
        <span class="img-info__title">Downloads</span>${img.downloads}
        </li>
    </ul>
  </a>
</li>`
    );
  }

  loadMoreBtn.style.display = 'flex';
}

async function loadMoreImgs() {
  if (loadedImgs >= totalImgs) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    loadMoreBtn.style.display = 'none';
    return;
  }

  currentPage += 1;
  const response = await fetchImgs(input).catch(() => {
    currentPage -= 1;
    Notify.failure('Something went wrong... Please try again...');
    return;
  });

  loadImgs(response.hits);
  lightbox.refresh();
}
