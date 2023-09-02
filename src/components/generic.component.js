import React from "react";
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

export default class GenericComponent extends React.Component
{
    render()
    {
        return <div className={this.props.editing ? 'component editing' : 'component'}>
            <h2>{this.props.title}</h2>
            <h4><ReactMarkdown remarkPlugins={[gfm]}>{this.props.description}</ReactMarkdown></h4>
        </div>
    }
}