import React from 'react'

import profileImage from '../static/profile.png'
import parseMD from "parse-md";

import './home.css'
import '../index.css'
import Link from "../router/link";

const importAll = (r) => r.keys().map(r);
const postFiles = importAll(require.context("../news/", true, /\.md$/))
    .sort()
    .reverse();

export default class Home extends React.Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            posts: [],
        }
    }

    async componentDidMount()
    {
        let _posts = await Promise.all(postFiles.map((file) => file.default)
        ).catch((err) => console.error(err));

        let posts = _posts.slice(0, 4)

        this.setState((state) => ({...state, posts}));
    }

    render()
    {
        return <div className="container">
            <div className="Home-Container">
                <div className="left">
                    <div className="section">
                        <div className={"top"}>
                            <p className="m p-no-margin-top">👋 rar.vg</p>
                            <h2 className="xxl p-no-margin-top p-no-margin-bottom">Create your profile.</h2>
                        </div>
                        <div className={"bottom"}>
                            <Link to={"/register"}>
                                <button className="btn mm">Create your page!</button>
                            </Link>
                            <br/>
                            <div className="link-log-in">
                                <Link to={"/login"}><a className="s">Already have one? Log in!</a></Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="right">
                    <div className={"left-card"}>
                        <div className={"card purple"}>
                            <div className={"top"}>
                                <h2 className={"l p-no-margin-top p-no-margin-bottom"}>Establish your online
                                    presence</h2><br/>
                                <span className={"s"}>Show the world who you are and what you do.</span>
                            </div>
                            <img src={profileImage} alt={"Profile screenshot"}/>
                        </div>
                    </div>
                    <div className={"right-card"}>
                        <div className={"right-posts-header"}>
                            <span className={"ll"}>Latest posts</span>
                        </div>
                        {this.state.posts.map((post, key) => (
                            <a key={key} href={"/post?p=" + parseMD(post).metadata.id}>
                                <div style={{backgroundImage: `url(${parseMD(post).metadata.banner})`}}
                                     className={"card green"}>
                                    <div className={"top"}>
                                        <span className={"m"}>{parseMD(post).metadata.title}</span><br/>
                                        <span
                                            className={"s"}>Written by {parseMD(post).metadata.author_displayname}</span>
                                    </div>
                                    <img src={""}/>
                                </div>
                            </a>
                        ))}
                        <Link to={'/posts'}>
                            <div className={"card orange"}>
                                <div className={"top"}>
                                    <span className={"m"}>More posts 👉</span><br/>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    }
}
