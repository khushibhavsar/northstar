# NorthStar ✦

NorthStar is a personalized trip-planning web app that generates a simple day-by-day itinerary based on destination, travel dates, arrival/departure times, and number of travellers.

## Live Demo

https://khushibhavsar.github.io/northstar/

## Features

- Enter a destination city
- Choose travel dates
- Choose arrival and departure times
- Choose number of travellers
- Fetch real tourist attractions using the Geoapify API
- Generate a simple day-by-day itinerary
- Display attraction names, addresses, and images

## Tech Stack

- React
- JavaScript
- Vite
- CSS
- Geoapify API
- Wikipedia API
- GitHub Pages

## How It Works

1. The user enters trip information.
2. NorthStar sends the destination to the Geoapify Geocoding API.
3. The API returns latitude and longitude.
4. NorthStar uses those coordinates to fetch nearby tourist attractions.
5. The attractions are filtered and divided across the trip days.
6. Arrival and departure times affect how many activities are scheduled on the first and last day.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/khushibhavsar/northstar.git
