import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [travellers, setTravellers] = useState(1);

  const [trip, setTrip] = useState(null);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [itinerary, setItinerary] = useState([]);
  const [message, setMessage] = useState("");

  const [placeImages, setPlaceImages] = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState(false);


  async function findPhotoOnWikipedia(placeName, cityName) {
    const searchTerm = `${placeName} ${cityName}`;

    const wikiUrl =
      "https://en.wikipedia.org/w/api.php" +
      "?origin=*" +
      "&action=query" +
      "&generator=search" +
      `&gsrsearch=${encodeURIComponent(searchTerm)}` +
      "&gsrlimit=1" +
      "&prop=pageimages" +
      "&piprop=thumbnail" +
      "&pithumbsize=500" +
      "&format=json";

    try {
      const wikiResponse = await fetch(wikiUrl);
      const wikiData = await wikiResponse.json();

      const pages = wikiData.query && wikiData.query.pages;

      if (pages) {
        const firstPage = Object.values(pages)[0];

        if (firstPage.thumbnail) {
          return firstPage.thumbnail.source;
        }
      }
    } catch (error) {
      console.log("Wikipedia photo lookup failed:", error);
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (endDate < startDate) {
      alert("End date cannot be before the start date.");
      return;
    }

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    console.log("API key loaded:", Boolean(apiKey));

    setMessage("");
    setItinerary([]);


    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      destination
    )}&format=json&apiKey=${apiKey}`;

    const response = await fetch(url);

    const data = await response.json();

    console.log("Location:", data);

    if (data.results.length === 0) {
      setMessage(
        "Destination not found. Try entering a specific city such as Reykjavik, Iceland."
      );

      return;
    }

    const location = data.results[0];

    setLatitude(location.lat);
    setLongitude(location.lon);


    const placesUrl = `https://api.geoapify.com/v2/places?categories=tourism&filter=circle:${location.lon},${location.lat},15000&limit=10&apiKey=${apiKey}`;

    const placesResponse = await fetch(placesUrl);

    const placesData = await placesResponse.json();

    console.log("Places:", placesData);

    const fetchedPlaces = placesData.features.filter((place) => {
      return place.properties.name;
    });

    if (fetchedPlaces.length === 0) {
      setMessage(
        "No places were found. Try entering a more specific destination city."
      );

      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference = end - start;

    const numberOfDays =
      Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;

    console.log("Trip days:", numberOfDays);

    const arrivalHour = Number(
      arrivalTime.split(":")[0]
    );

    const departureHour = Number(
      departureTime.split(":")[0]
    );

    const newItinerary = [];

    let currentPlaceIndex = 0;

    for (let day = 0; day < numberOfDays; day++) {
      let placesForThisDay = 3;

      if (day === 0) {
        if (arrivalHour >= 17) {
          placesForThisDay = 1;
        } else if (arrivalHour >= 13) {
          placesForThisDay = 2;
        }
      }

      if (day === numberOfDays - 1) {
        if (departureHour <= 12) {
          placesForThisDay = 1;
        } else if (departureHour <= 16) {
          placesForThisDay = 2;
        }
      }

      const dayPlaces = fetchedPlaces.slice(
        currentPlaceIndex,
        currentPlaceIndex + placesForThisDay
      );

      if (dayPlaces.length > 0) {
        newItinerary.push(dayPlaces);
      }

      currentPlaceIndex += placesForThisDay;
    }

    setItinerary(newItinerary);


    const newTrip = {
      destination,
      startDate,
      endDate,
      arrivalTime,
      departureTime,
      travellers,
    };

    setTrip(newTrip);


    setLoadingPhotos(true);


    const allPlacesInItinerary = newItinerary.flat();

    const photoResults = await Promise.all(
      allPlacesInItinerary.map((place) =>
        findPhotoOnWikipedia(place.properties.name, destination)
      )
    );

    const newPlaceImages = {};

    allPlacesInItinerary.forEach((place, index) => {
      newPlaceImages[place.properties.place_id] = photoResults[index];
    });

    setPlaceImages(newPlaceImages);
    setLoadingPhotos(false);


    setPage("itinerary");
  }

  function getPlaceImage(place) {
    const realPhoto = placeImages[place.properties.place_id];

    if (realPhoto) {
      return realPhoto;
    }

    const seed = place.properties.place_id || place.properties.name;
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/300`;
  }

  function handlePlanAnotherTrip() {
    setPage("home");
    setMessage("");
  }

  return (
    <div className="app">
      {page === "home" && (
        <div className="home-page">
          <div className="hero">
            <svg
              className="earth-svg"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="100" cy="100" r="95" fill="url(#oceanGradient)" />
              <path
                className="continent"
                d="M40,70 Q60,50 90,60 Q110,45 130,65 Q145,55 150,75 Q135,90 110,85 Q95,105 70,95 Q50,100 40,70 Z"
              />
              <path
                className="continent"
                d="M60,120 Q80,110 100,125 Q120,115 135,130 Q130,150 105,155 Q85,160 70,145 Q55,140 60,120 Z"
              />
              <defs>
                <radialGradient id="oceanGradient" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#7fd9ff" />
                  <stop offset="55%" stopColor="#2aa9e0" />
                  <stop offset="100%" stopColor="#1573b0" />
                </radialGradient>
              </defs>
            </svg>

            <h1>NorthStar ✦</h1>
            <p>Plan your next adventure, anywhere on earth.</p>
          </div>

          <form className="trip-form" onSubmit={handleSubmit}>
            <div>
              <label>Destination City</label>

              <br />

              <input
                type="text"
                placeholder="e.g. Reykjavik, Iceland"
                value={destination}
                onChange={(event) =>
                  setDestination(event.target.value)
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Start Date</label>

              <br />

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                required
              />
            </div>

            <br />

            <div>
              <label>End Date</label>

              <br />

              <input
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Arrival Time</label>

              <br />

              <input
                type="time"
                value={arrivalTime}
                onChange={(event) =>
                  setArrivalTime(event.target.value)
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Departure Time</label>

              <br />

              <input
                type="time"
                value={departureTime}
                onChange={(event) =>
                  setDepartureTime(event.target.value)
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Number of Travellers</label>

              <br />

              <input
                type="number"
                min="1"
                value={travellers}
                onChange={(event) =>
                  setTravellers(event.target.value)
                }
                required
              />
            </div>

            <br />

            <button type="submit" disabled={loadingPhotos}>
              {loadingPhotos ? "Finding photos..." : "Create My Trip"}
            </button>
          </form>


          {message && (
            <p className="form-message">{message}</p>
          )}
        </div>
      )}


      {page === "itinerary" && trip && (
        <div className="itinerary-page">
          <button className="back-button" onClick={handlePlanAnotherTrip}>
            ← Plan Another Trip
          </button>

          <div className="trip-summary">
            <h2>Your Trip ✦</h2>

            <p>
              📍 {trip.destination}
            </p>

            <p>
              📅 {trip.startDate} → {trip.endDate}
            </p>

            <p>
              🛬 Arrival: {trip.arrivalTime}
            </p>

            <p>
              🛫 Departure: {trip.departureTime}
            </p>

            <p>
              👥 {trip.travellers} traveller(s)
            </p>
          </div>

          {itinerary.length > 0 && (
            <div className="itinerary">
              <h2>Your Itinerary</h2>

              {itinerary.map(
                (dayPlaces, dayIndex) => (
                  <div className="day-card" key={dayIndex}>
                    <h3>
                      Day {dayIndex + 1}
                    </h3>

                    {dayPlaces.map((place) => (
                      <div
                        className="place-card"
                        key={
                          place.properties.place_id
                        }
                      >
                        <img
                          className="place-image"
                          src={getPlaceImage(place)}
                          alt={place.properties.name}
                        />

                        <div className="place-text">
                          <h4>
                            {
                              place.properties
                                .name
                            }
                          </h4>

                          <p>
                            {
                              place.properties
                                .formatted
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;