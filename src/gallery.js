import { fetchImgs } from './fetchImgs';
import 'modern-normalize/modern-normalize.css';
import { Notify } from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';
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
  try {
    event.preventDefault();

    Notify.info('Processing your request! Please wait...');

    input = form.searchQuery.value;
    currentPage = 1;
    loadedImgs = 0;
    totalImgs = 0;

    gallery.innerHTML = '';
    loadMoreBtn.style.display = 'none';

    const response = await fetchImgs(input, currentPage, loadedImgs).catch(
      () => {
        return;
      }
    );

    totalImgs = response[0].total;
    Notify.success(`Hooray! We found ${totalImgs} images!`);

    currentPage = response[1];
    loadedImgs = response[2];

    loadImgs(response[0].hits);
    lightbox = new SimpleLightbox('.gallery a');
  } catch (error) {
    return;
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
  const response = await fetchImgs(input, currentPage, loadedImgs).catch(() => {
    currentPage -= 1;
    Notify.failure('Something went wrong... Please try again...');
    return;
  });

  currentPage = response[1];
  loadedImgs = response[2];
  loadImgs(response[0].hits);
  lightbox.refresh();
}
