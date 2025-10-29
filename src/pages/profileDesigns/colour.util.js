const colours = [
    {
        background: "#170b37",
        card: "#0e0c16",
        accent: "var(--push-text)",
        addComponentButton: "#4b4172",
        username: "#444",
        accentLines: "#333",
        linkBackground: "linear-gradient(310deg, #181623, #1e1b2d)",
        selectComponent: "rgba(255, 255, 255, 0.3)"
    },
    {
        background: "#fa6450",
        card: "#f3f0e5",
        accent: "#cc1c16",
        addComponentButton: "#f33d1d",
        username: "#f33d1d",
        accentLines: "#f33d1d",
        linkBackground: "#f7b7b0",
        selectComponent: "rgba(0, 0, 0, 0.2)"
    },
    {
        background: "#eee",
        card: "#fff",
        accent: "#111",
        addComponentButton: "#111",
        username: "#111",
        accentLines: "#111",
        linkBackground: "#e4e4e4",
        selectComponent: "rgba(0, 0, 0, 0.2)"
    },
    {
        background: "#64c27b",
        card: "#d0fdd7",
        accent: "#2a8c4a",
        addComponentButton: "#2a8c4a",
        username: "#2a8c4a",
        accentLines: "#2a8c4a",
        linkBackground: "#9bfab0",
        selectComponent: "rgba(0, 0, 0, 0.2)"
    },
    {
        background: "#5fa8d3",
        card: "#cae9ff",
        accent: "#1b4965",
        addComponentButton: "#1b4965",
        username: "#1b4965",
        accentLines: "#1b4965",
        linkBackground: "#62b6cb",
        selectComponent: "rgba(0, 0, 0, 0.2)"
    },
    {
        background: "#a594f9",
        card: "#f5efff",
        accent: "#7371fc",
        addComponentButton: "#7371fc",
        username: "#7371fc",
        accentLines: "#7371fc",
        linkBackground: "#e5d9f2",
        selectComponent: "rgba(0, 0, 0, 0.2)"
    },
    {
        background: "#E6AF2E",
        card: "#ebd690",
        accent: "#774E24",
        addComponentButton: "#774E24",
        username: "#774E24",
        accentLines: "#774E24",
        linkBackground: "#cfba76",
        selectComponent: "rgba(0, 0, 0, 0.2)"
    },
    {
        background: "#222823",
        card: "#d1ffbd",
        accent: "#222823",
        addComponentButton: "#7ae582",
        username: "#222823",
        accentLines: "#222823",
        linkBackground: "#b6f7c1",
        selectComponent: "rgba(0, 0, 0, 0.15)"
    },
    {
        background: "#2d232e",
        card: "#e23e57",
        accent: "#fff",
        addComponentButton: "#88304e",
        username: "#fff",
        accentLines: "#fff",
        linkBackground: "#88304e",
        selectComponent: "rgba(255, 255, 255, 0.15)"
    },
    // Paleta Crema (ajuste de contraste entre card y background)
    {
        background: "#f8eedc",
        card: "#fffbe6",
        accent: "#5c4326",
        addComponentButton: "#e6cfa7",
        username: "#5c4326",
        accentLines: "#5c4326",
        linkBackground: "#f5e9c8",
        selectComponent: "rgba(0,0,0,0.07)"
    },
    // Gruvbox
    {
        background: "#282828",
        card: "#3c3836",
        accent: "#fabd2f",
        addComponentButton: "#b8bb26",
        username: "#ebdbb2",
        accentLines: "#fe8019",
        linkBackground: "#504945",
        selectComponent: "rgba(255,255,255,0.10)"
    },
    // Terracota
    {
        background: "#e2725b",
        card: "#f7c59f",
        accent: "#a0522d",
        addComponentButton: "#a0522d",
        username: "#6e2c00",
        accentLines: "#a0522d",
        linkBackground: "#dc9e7e",
        selectComponent: "rgba(0,0,0,0.10)"
    },
]

let styles = (colour) =>
{
    return {
        "--profile-background": colours[colour].background,
        "--card-background": colours[colour].card,
        "--profile-text-accent": colours[colour].accent,
        "--add-comp-btn-clr": colours[colour].addComponentButton,
        "--username-text": colours[colour].username,
        "--accent-lines": colours[colour].accentLines,
        "--link-background": colours[colour].linkBackground,
        "--select-component": colours[colour].selectComponent,
    }
}

module.exports = {colours, styles}