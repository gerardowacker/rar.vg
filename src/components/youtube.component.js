import React from 'react'

export default class YouTubeComponent extends React.Component
{
    render()
    {
        return <div className={this.props.editing ? 'component editing' : 'component'}>
            <iframe style={{borderRadius: "12px", pointerEvents: this.props.editing ? "none" : "all"}}
                    src={"https://www.youtube-nocookie.com/embed/" + this.props.id}
                    width={"100%"} height={400} frameBorder={"0"} allowFullScreen={true}
                    allow={"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"}
                    loading={"lazy"}></iframe>
        </div>
    }
}