<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/joshsny/SpeedStore">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">SpeedStore</h3>

  <p align="center">
    Blazingly fast Properties storage for Google Apps Script ⚡
    <br />
    <br />
    <br />
    <a href="https://github.com/joshsny/SpeedStore">View Demo</a>
    ·
    <a href="https://github.com/joshsny/SpeedStore/issues">Report Bug</a>
    ·
    <a href="https://github.com/joshsny/SpeedStore/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-speedstore">About SpeedStore</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
    </li>
    <li><a href="#how-to-use-speedstore">How to use SpeedStore</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details> -->



<!-- ABOUT THE PROJECT -->
## About SpeedStore

[![Product Name Screen Shot][product-screenshot]](https://example.com)

Retrieving and saving properties in Google Apps Script can be slow, especially if there are a lot of them. SpeedStore is a blazingly fast in memory properties store which you can use to make retrieving and saving properties much easier. It stores a copy of your Properties in memory to do the following:
  - **It only costs you for the first read (~50ms), subsequent reads are from memory rather than the store. This significantly speeds up scripts which read a lot of properties (e.g. Add-Ons).**
  - **The store is chunked, allowing you to save/retrieve properties up to 500kb rather than only being able to store properties smaller than 9kb**
  - **It takes care of parsing objects for you, so you don't need to JSON serialize/parse them every time.**


<!-- GETTING STARTED -->
## Getting Started

To get started with SpeedStore all you need to do is add the library to your Apps Script project and you are good to go!
```json
{
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "SpeedStore",
        "libraryId": "XXX",
        "version": "XXX"
      }
    ]
  },
  //...
}
```

## Create your SpeedStore

SpeedStore works best when it is used as a global variable. To do this, add the following in any file of your Google Apps Script project:
```javascript
let store = SpeedStore.getStore();
```

<!-- USAGE EXAMPLES -->
## How to use SpeedStore

Using SpeedStore is simple.

```javascript
// Get data from the store
store.get('fruits')

// Set data in the store
store.set('fruits', ['Apple', 'Orange', 'Pinapple'])

// Set multiple items at the same time
store.setMany({fruits: ['Apple', 'Orange', 'Pinapple'], vegetables: ['Cucumber', 'Avocado'], favourites: {fruit: 'Orange', vegetable: 'Avocado'}})

// Check if something exists in the store
store.exists('fruits')

// Delete something from the store
store.delete('fruits')

// Remove everything from the store
store.deleteAll()
```

## Configuration

### Configuring the store

When initializing the store you can pass it configuration options. The following options are available:
- `store`: This can be one of `PropertiesService.getScriptProperties()`, `PropertiesService.getUserProperties()` or `PropertiesService.getDocumentProperties()` depending on where you want things to be stored.
- `numChunks`: SpeedStore works by storing everything as one large JSON object and splitting it across multiple chunks to overcome the 9kb size limit for properties in Google Apps Script. This option determines the number of chunks the store will be split into.
- `prefix`: Chunks of your SpeedStore are stored at a prefix so they don't conflict with other values.
- `applyCompression`: Since SpeedStore is focused on speed, it does not compress the store by default. If you need to store very large values (over the 500kb total limit for Properties stores) setting this to true will allow you to store 2-5x the amount of data, depending on how compressible it is.
- `encode`: The function used to encode the store.
- `decode`: The function used to decode the store.

Here is an example with the default configuration for each setting:
```javascript
let store = SpeedStore.getStore({
  store: PropertiesService.getUserProperties(),
  numChunks: 50,
  prefix: "speedstore_",
  applyCompression: false,
  encode: JSON.stringify,
  decode: JSON.parse
})
```

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Joshua Snyder - [@joshsny](https://twitter.com/joshsny) - [linkedIn](https://linkedin.com/in/joshsny)

Project Link: [https://github.com/joshsny/SpeedStore](https://github.com/joshsny/SpeedStore)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* [LZipper - Used for compression](https://github.com/blindman67/LZipper)





<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/joshsny/SpeedStore.svg?style=for-the-badge
[contributors-url]: https://github.com/joshsny/SpeedStore/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/joshsny/SpeedStore.svg?style=for-the-badge
[forks-url]: https://github.com/joshsny/SpeedStore/network/members
[stars-shield]: https://img.shields.io/github/stars/joshsny/SpeedStore.svg?style=for-the-badge
[stars-url]: https://github.com/joshsny/SpeedStore/stargazers
[issues-shield]: https://img.shields.io/github/issues/joshsny/SpeedStore.svg?style=for-the-badge
[issues-url]: https://github.com/joshsny/SpeedStore/issues
[license-shield]: https://img.shields.io/github/license/joshsny/SpeedStore.svg?style=for-the-badge
[license-url]: https://github.com/joshsny/SpeedStore/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/joshsny
