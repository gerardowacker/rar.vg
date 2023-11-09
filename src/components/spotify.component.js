import React from 'react'

export default class SpotifyComponent extends React.Component
{
    render()
    {
        return <div className={this.props.editing ? 'component editing' : 'component'}>
            <iframe style={{borderRadius: "12px", pointerEvents: this.props.editing ? "none" : "all"}}
                    src={"https://open.spotify.com/embed/playlist/" + this.props.id}
                    width={"100%"} frameBorder={0} height={"400"} allowFullScreen={true}
                    allow={"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"}
                    loading={"lazy"}></iframe>
        </div>
    }
}