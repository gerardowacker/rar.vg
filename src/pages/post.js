import React from 'react'
import Header from "../components/header";
import Footer from "../components/footer";
import Link from "../router/link";
import parseMD from "parse-md";
import gfm from "remark-gfm";
import reactBreaks from 'remark-breaks'
import ReactMarkdown from "react-markdown";

import './home.css'
import '../index.css'
import './post.css'

const importAll = (r) => r.keys().map(r);
const postFiles = importAll(require.context("../news/", true, /\.md$/))
    .sort()
    .reverse();

export default class Post extends React.Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            post: null,
            posts: null,
        }
    }

    async componentDidMount()
    {
        if (this.state.post == null)
        {
            const post = require('../news/' + this.props.post + '.md')
            this.setState({post: post.default})
        }

        if (this.state.posts == null)
        {
            let _posts = await Promise.all(postFiles.map((file) => file.default)
            ).catch((err) => console.error(err));

            let posts = _posts.slice(0, 4)

            this.setState((state) => ({...state, posts}));
        }
    }

    latestPosts = (posts) =>
    {
        return <div className={"latest-posts"}>
            <div className="lp-header">
                <Link className="post-link" to="/">Posts</Link> {"> Latest"}
            </div>
            <div className={"lp-cont"}>
                {posts != null ? posts.map((post, key) => (
                    <a key={key} href={"/post?p=" + parseMD(post).metadata.id}>
                        <div className={"entry"}>
                            <span>{parseMD(post).metadata.title}</span><br/>
                        </div>
                    </a>
                )) : <></>}
                <a href={"/posts"}>
                    <div className={"entry alternative"}>
                        <span>More news 👉</span>
                    </div>
                </a>
            </div>
        </div>
    }

    render()
    {
        if (this.state.post)
        {
            const parsedContent = parseMD(this.state.post)
            return <div className={'container'}>
                <Header/>
                <div className={"post-container"}>
                    <div className="post">
                        <div className="post-header">
                            <Link className="post-link" to="/posts">Posts</Link> {"> "} <Link
                            to={"/post?p=" + parsedContent.metadata.id}>{parsedContent.metadata.title}</Link>
                        </div>
                        <div className="banner" style={{backgroundImage: `url(${parsedContent.metadata.banner})`}}>
                            <div className="banner-content">
                                <span className="ll">{parsedContent.metadata.title}</span><br/>
                                <span className="s">
                                    Written by <a href={`https://${parsedContent.metadata.author_username}.rar.vg`}>
                                        {parsedContent.metadata.author_displayname}
                                    </a>
                            </span>
                            </div>
                        </div>
                        <ReactMarkdown className={"post-content"}
                                       remarkPlugins={[gfm, reactBreaks]}
                                       children={parsedContent.content.replace(/\n/gi, "&nbsp; \n")}/>
                    </div>
                    {this.latestPosts(this.state.posts)}
                </div>
                <Footer/>
            </div>
        }
        else return <div></div>
    }
}