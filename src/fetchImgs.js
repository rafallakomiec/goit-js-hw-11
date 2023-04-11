export { fetchImgs };

async function fetchImgs(query) {
  try {
    if (query.length > 100) {
      throw new Error('Please enter maximum 100 characters...');
    }
    if (query.trim() === '') {
      throw new Error('Please enter meaningful query...');
    }

    const encodedQuery = encodeURIComponent(query.replaceAll(' ', '+'));

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
