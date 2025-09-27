import React from "react";

export default class SpotifyPanel extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            // Spotify
            spotifyMessage: null,
            spotifyLink: "",
        }
        this.handleSpotifyLinkChange = this.handleSpotifyLinkChange.bind(this)
    }

    displaySpotifyMessage = (message) =>
    {
        this.setState({spotifyMessage: message})
        setTimeout(() => this.setState({spotifyMessage: null}), 5000)
    }

    handleSpotifyLinkChange(event)
    {
        this.setState({spotifyLink: event.target.value})
    }

    updateSpotifyLink = (link) =>
    {
        const regex = /^(https:\/\/open.spotify.com\/playlist\/|https:\/\/open.spotify.com\/user\/[a-zA-Z0-9]+\/playlist\/|spotify:user:[a-zA-Z0-9]+:playlist:|spotify:playlist:37i9dQZF1DZ06evO2ZpGiQ)([a-zA-Z0-9]+)(.*)$/
        let match = link.match(regex)
        if (!match)
            return this.displaySpotifyMessage({type: 'error', message: 'The provided Spotify link is invalid.'})

        this.props.updateLocallyWithoutCancelling(match[2]).then(result =>
        {
        })
    }

    render()
    {
        return <>
            <h3 className="m p-no-margin-top p-no-margin-bottom">Edit Spotify playlist</h3>
            {this.props.drawMessage(this.state.spotifyMessage)}
            <h2 className="s p-no-margin-bottom p-no-margin-top title">Import a Spotify playlist link:</h2>
            <input className="input" type="text"
                   placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=6d5152d5b4454b4f"
                   value={this.state.spotifyLink} onChange={this.handleSpotifyLinkChange}/>
            <div>
                <button className="load-button"
                        onClick={() => this.updateSpotifyLink(this.state.spotifyLink)}>Load playlist
                </button>
            </div>
            <iframe style={{borderRadius: "12px"}}
                    src={"https://open.spotify.com/embed/playlist/" + this.props.component.content}
                    width={"100%"} frameBorder={0} height={"400"} allowFullScreen={true}
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