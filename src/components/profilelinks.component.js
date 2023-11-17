import React from "react";

import {IoIosAdd} from 'react-icons/io'
import {
    FaSteam,
    FaItunesNote,
    FaBitcoin,
    FaEthereum,
    FaDiscord,
    FaTiktok,
} from "react-icons/fa";
import {CgWebsite} from "react-icons/cg";
import {SiCashapp} from "react-icons/si";
import {
    BsSpotify,
    BsInstagram,
    BsTwitter,
    BsFacebook,
    BsGithub,
    BsTwitch,
    BsYoutube,
    BsLinkedin,
} from "react-icons/bs";

import "./profilelinks.component.css";

export default class ProfileLinks extends React.Component
{
    icons = {
        steam: {
            icon: <FaSteam size={30}/>,
            link: "https://steamcommunity.com/id/",
        },
        itunes: {
            icon: <FaItunesNote size={30}/>,
            link: "https://music.apple.com/us/artist/",
        },
        bitcoin: {icon: <FaBitcoin size={30}/>, popup: true},
        ethereum: {icon: <FaEthereum size={30}/>, popup: true},
        discord: {icon: <FaDiscord size={30}/>, popup: true},
        tiktok: {icon: <FaTiktok size={30}/>, link: "https://www.tiktok.com/"},
        website: {icon: <CgWebsite size={30}/>, link: ""},
        cashapp: {icon: <SiCashapp size={30}/>, link: "https://cash.app/"},
        spotify: {
            icon: <BsSpotify size={30}/>,
            link: "https://open.spotify.com/artist/",
        },
        instagram: {
            icon: <BsInstagram size={30}/>,
            link: "https://instagram.com/",
        },
        twitter: {icon: <BsTwitter size={30}/>, link: "https://twitter.com/"},
        facebook: {icon: <BsFacebook size={30}/>, link: "https://facebook.com/"},
        github: {icon: <BsGithub size={30}/>, link: "https://github.com/"},
        twitch: {icon: <BsTwitch size={30}/>, link: "https://twitch.tv/"},
        youtube: {
            icon: <BsYoutube size={30}/>,
            link: "https://youtube.com/channel/",
        },
        linkedin: {
            icon: <BsLinkedin size={30}/>,
            link: "https://linkedin.com/in/",
        },
    };

    iconLink = (social) =>
    {
        if (!this.icons[social.name]) return <div></div>;

        const icon = this.icons[social.name];

        if (icon.popup)
        {
            return (
                <button onClick={() => console.log(social.content)}>{icon.icon}</button>
            );
        }
        else
        {
            return (
                <a href={this.icons[social.name].link + social.content}>{icon.icon}</a>
            );
        }
    };

    render()
    {
        const socials = this.props.socials;
        return (
            <div className={"socials socials-d" + this.props.design}>
                {socials.map((social) => this.iconLink(social))}
                {this.props.editing ? <button><IoIosAdd size={30}/></button> : <></>}
            </div>
        );
    }
}