import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/review/ratings')
      .then(response => {
        setRatings(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the ratings!", error);
      });
  }, []);

  function stars(number) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < number ? '★' : '☆';
    }
    return stars;
  }

  return (
    <div className="App">
      <header className="App-header">
        <u className='title'>
          Client Ratings
        </u>
        <ul>
          {ratings && ratings.map(rating => (
            <li key={rating.providerId} className='list-item'>
              Provider ID: {rating.providerId}, Rating: <span className='stars'>{stars(rating.rating)}</span> ({rating.rating})
            </li>
          ))}
          {(ratings.length === 0 || !ratings )&& <li>No ratings found</li>}
        </ul>
      </header>
    </div>
  );
}

export default App;
