import React from "react";

export default class YoutubePanel extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            // YouTube
            youtubeMessage: null,
            youtubeLink: "",
        }
        this.handleYouTubeLinkChange = this.handleYouTubeLinkChange.bind(this)
    }

    handleYouTubeLinkChange(event)
    {
        this.setState({youtubeLink: event.target.value})
    }

    displayYouTubeMessage = (message) =>
    {
        this.setState({youtubeMessage: message})
        setTimeout(() => this.setState({youtubeMessage: null}), 5000)
    }


    updateYouTubeLink = (link) =>
    {
        const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/
        let match = link.match(regex)
        if (!match)
            return this.displayYouTubeMessage({type: 'error', message: 'The provided YouTube link is invalid.'})

        this.props.updateLocallyWithoutCancelling(match[6]).then(result =>
        {
        })
    }

    render()
    {
        return <>
            <h3 className="m p-no-margin-top p-no-margin-bottom">Edit YouTube video</h3>
            {this.props.drawMessage(this.state.youtubeMessage)}
            <h2 className="s p-no-margin-bottom p-no-margin-top title">Import a YouTube video link:</h2>
            <input className="input" type="text" placeholder="https://www.youtube.com/watch?v=DgKpLoz29jo"
                   value={this.state.youtubeLink} onChange={this.handleYouTubeLinkChange}/>
            <div>
                <button className="load-button"
                        onClick={() => this.updateYouTubeLink(this.state.youtubeLink)}>Load video
                </button>
            </div>
            <iframe style={{borderRadius: "12px"}}
                    src={"https://www.youtube-nocookie.com/embed/" + this.props.component.content}
                    width={"100%"} height={400} frameBorder={"0"} allowFullScreen={true}
                    allow={"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"}
                    loading={"lazy"}></iframe>
            <div className="margin-button">
                <button className="delete-component"
                        onClick={() => this.props.deleteSelectedComponent()}>Delete component
                </button>
                <button className="done-button" onClick={() => this.cancel()}>Done</button>
            </div>
        </>
    }
}