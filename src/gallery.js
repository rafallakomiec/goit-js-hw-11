import 'modern-normalize/modern-normalize.css';
import { Notify } from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';
const axios = require('axios').default;

const form = document.querySelector('#search-form');
const input = form.searchQuery.value;
const loadMoreBtn = document.querySelector('#load-more-btn');

let currentPage = 1;
let loadedImgs = 0;
let totalImgs = 0;

function onSubmit(event) {}

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
      return result.data;
    } else {
      throw new Error(result.status + result.statusText);
    }
  } catch (error) {
    Notify.failure(error.message);
  }
}

/* <li class="gallery__card">
  <img class="gallery__img" src="./images/search.svg" loading="lazy" />
  <ul class="gallery__img-info-cont">
    <li class="gallery__img-info-likes">
      <span class="img-info__title">Likes</span>111111
    </li>
    <li class="gallery__img-info-views">
      <span class="img-info__title">Views</span>111111
    </li>
    <li class="gallery__img-info-comments">
      <span class="img-info__title">Comments</span>111111
    </li>
    <li class="gallery__img-info-downloads">
      <span class="img-info__title">Downloads</span>111111
    </li>
  </ul>
</li>; */
