# Animator Portfolio Website

A dynamic and interactive portfolio website designed for animators to showcase their work with engaging animations and a modern UI.

## Features

- **Animated UI Elements**: Dynamic animations throughout the site create an engaging user experience that reflects the creative nature of animation work.
- **Custom Cursor**: A unique animated cursor follows the user's mouse movements, enhancing the interactive feel.
- **Responsive Design**: Fully responsive layout that works on all devices from mobile to desktop.
- **Portfolio Filtering**: Interactive filtering system to categorize and display different types of animation work.
- **Contact Form**: Integrated contact form for potential clients to reach out.
- **Smooth Scrolling**: Enhanced navigation with smooth scrolling between sections.
- **Animated Skill Bars**: Visual representation of skills with animated progress bars.

## Technologies Used

- HTML5
- CSS3 (with modern features like CSS variables, flexbox, and grid)
- JavaScript (vanilla, no frameworks)
- Intersection Observer API for scroll animations
- CSS Animations and Transitions

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your browser to view the website
3. Customize the content in the HTML file to showcase your own work
4. Replace the placeholder images with your own animation projects
5. Update the contact information with your own details

## Customization

### Changing Colors

The color scheme can be easily modified by changing the CSS variables in the `:root` selector in `styles.css`:

```css
:root {
    --primary-color: #6c63ff;
    --secondary-color: #ff6584;
    --accent-color: #43cea2;
    --dark-color: #2c2c54;
    --light-color: #f9f9f9;
    /* other variables */
}
```

### Adding Projects

To add new projects to your portfolio:

1. Duplicate one of the existing `.portfolio-item` elements in the HTML
2. Update the content (title, category, etc.)
3. Add your project image or animation
4. Set the appropriate `data-category` attribute for filtering

### Modifying Animations

The website includes various animations that can be customized in the CSS file:
- Floating shapes in the hero section
- Skill bar animations
- Portfolio item hover effects
- Section transitions

## Browser Support

This website works in all modern browsers that support CSS variables, flexbox, and the Intersection Observer API:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is available for personal and commercial use. Attribution is appreciated but not required.

## Credits

- Fonts: [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
- Icons: [Font Awesome](https://fontawesome.com/)

---

Created with ❤️ for animators and creative professionals 