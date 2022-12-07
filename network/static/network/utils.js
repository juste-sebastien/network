export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }
  
  export function fetchHeaders(csrftoken) {
      return {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken' : csrftoken,
      };
  }

export function convertTime(time) {
    var since = 0;
    if (time > 864 * Math.pow(10, 5)) {
        since = Math.round(time / (864 * Math.pow(10, 5)));
        return `${since} days`;
    } else if (time > 36 * Math.pow(10, 5)) {
        since = Math.round(time / (36 * Math.pow(10, 5)));
        return `${since} hours`;
    } else if (time > 6 * Math.pow(10, 4)) {
        since = Math.round(time / (6 * Math.pow(10, 4)));
        return `${since} minutes`;
    } else {
        since = Math.round(time / (1 * Math.pow(10, 3)));
        return `${since} seconds`;
    }
}