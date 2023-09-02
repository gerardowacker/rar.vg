import config from '../utils/config.util'
import './pdf.component.css'
import React from "react";

export default class PDFComponent extends React.Component
{
    constructor(props)
    {
        super(props)
    }

    render()
    {
        return <div className={this.props.editing ? 'component editing' : 'component'}>
            <object className={"pdf"} type={"application/pdf"}
                    data={config('HOST') + "/uploads/" + this.props.fileId + ".pdf#toolbar=0&navpanes=0&scrollbar=0\""}/>
        </div>
    }
}
