import React from "react";
import parseMD from "parse-md";

import './news.css'
import Header from "../components/header";
import Footer from "../components/footer";
import Link from "../router/link";

const importAll = (r) => r.keys().map(r);
const postFiles = importAll(require.context("../news/", true, /\.md$/))
    .sort()
    .reverse();

export default class News extends React.Component
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
        console.log(postFiles)

        let posts = await Promise.all(postFiles.map((file) => file.default)
        ).catch((err) => console.error(err));

        this.setState((state) => ({...state, posts}));
    }

    render()
    {
        if (this.state.posts)
        {
            return <>
                <div className={"container"}>
                    <Header/>
                    <div className={"posts-container"}>
                        <div className={"page-name"}>
                            <span className={"ll"}>Latest posts</span>
                        </div>
                        <div className={"posts"}>
                            <div className="posts-header">
                                <Link className="post-link" to="/">Posts</Link>
                            </div>
                            <div className={"posts-content"}>
                                {this.state.posts.map((post, key) => (
                                    <a key={key} href={"/post?p=" + parseMD(post).metadata.id}>
                                        <div style={{backgroundImage: `url(${parseMD(post).metadata.banner})`}}
                                             className={"post-post"}>
                                            <div className={"top"}>
                                                <span className={"m"}>{parseMD(post).metadata.title}</span><br/>
                                                <span
                                                    className={"s"}>Written by {parseMD(post).metadata.author_displayname}</span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Footer/>
                </div>
            </>
        }
    }
}