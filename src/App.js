// new javascript with class fields
import React from 'react';

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}


class App extends React.Component {
  state = {
    location: "",
    isLoading: false,
    displayLocation: "",
    weather: {},
  };

  // eslint-disable-next-line no-useless-constructor
  constructor(props) {
    super(props);

    // this.state = {
    //   location: "pakistan",
    //   isLoading: false,
    //   displayLocation: "",
    //   weather: {},
    // };
    // this.fetchWeather = this.fetchWeather.bind(this);
  }

  // async fetchWeather() {
  fetchWeather = async () => {
    if (this.state.location.length < 2) return this.setState({ weather: {} });
    try {
      this.setState({ isLoading: true });
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      this.setState({ displayLocation: `${name} ${convertToFlag(country_code)}` });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  childToParentSetLocation = (e) => this.setState({ location: e.target.value })
  // like useEffect with dependency arry.e.g []
  componentDidMount() {
    this.setState({ location: localStorage.getItem('location') || "" });
  }
  // like useEffect with variable or state in dependency arry.e.g [location]
  componentDidUpdate(prevProps, prevState) {
    if (this.state.location !== prevState.location) {
      this.fetchWeather();

      localStorage.setItem('location', this.state.location)
    }
  }

  render() {
    return (
      <div className='app'>
        <h1>Classy Weather</h1>
        <Input location={this.state.location} onChangeLocation={this.childToParentSetLocation} />
        {this.state.isLoading && <p className="loader">Loading...</p>}

        {
          this.state.weather?.weathercode &&
          <Weather
            weather={this.state.weather}
            location={this.state.displayLocation}
          />
        }
      </div>
    )
  }
}

export default App;

class Input extends React.Component {
  render() {
    return (
      <div>
        <input type="text" name="" id="" placeholder='Search from location' value={this.props.location} onChange={this.props.onChangeLocation} />
      </div>
    )
  }
}

class Weather extends React.Component {
  // like returning a cleanup function from useEffect hook
  componentWillUnmount() {
    // if (this.state.location !== prevState.location) {
    //   this.fetchWeather();

    //   localStorage.setItem('location', this.state.location)
    // }
  }
  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: date,
      weathercode: codes,
    } = this.props.weather;
    return (
      <>
        <h2>Weather in {this.props.location}</h2>
        <ul className="weather">
          {date.map((date, i) =>
            <Day
              date={date}
              max={max[i]}
              min={min[i]}
              codes={codes[i]}
              key={date}
              isToday={i === 0}
            />
          )}
        </ul>
      </>
    )
  }
}

class Day extends React.Component {

  render() {
    const { date, min, max, codes, isToday } = this.props;
    return (
      <li className='day'>
        <span>{getWeatherIcon(codes)}</span>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>{Math.floor(min)}&deg; &mdash;
          <strong>
            {Math.ceil(max)}&deg;
          </strong>
        </p>
      </li>
    )
  }
}