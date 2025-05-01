import React from "react";
import {upload} from "../../utils/session.util";

export default class PDFPanel extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            // PDF file.
            selectedFile: null,
            fileMessage: null,
        }
    }

    displayPDFMessage = (message) =>
    {
        this.setState({fileMessage: message})
        setTimeout(() => this.setState({fileMessage: null}), 5000)
    }

    uploadPDF = () =>
    {
        this.uploadingDialog.showModal()
        fetch(this.state.selectedFile).then(r => r.blob()).then(blob =>
        {
            const result = new File([blob], "theFile.pdf", {type: 'application/pdf'})
            upload(result, false).then(result =>
            {
                if (result.success)
                {
                    this.uploadingDialog.close()
                    this.saveLocally({
                        fileId: result.content.split('.')[0]
                    })
                }
            })
        })
    }
    onFileChange = (event) =>
    {
        if (event.target.files && event.target.files[0])
        {
            if (event.target.files[0].name.split('.').pop() !== 'pdf')
                return this.displayPDFMessage({type: 'error', message: 'The selected file is not a PDF file!'})
            if (event.target.files[0].size / 1024 / 1024 > 1)
                return this.displayPDFMessage({type: 'error', message: 'The selected file is too large!'})
            this.setState({selectedFile: URL.createObjectURL(event.target.files[0])});
        }
    }

    render()
    {
        return <>
            <dialog ref={ref => this.uploadingDialog = ref} className={"dashboard-modal"}>
                <span className={"m"}>Uploading...</span>
            </dialog>
            <h3 className="m p-no-margin-top p-no-margin-bottom">Edit component</h3>
            {this.props.drawMessage(this.state.fileMessage)}
            <div>
                <label htmlFor="pdf-button" className="button-label">Upload PDF</label>
                <input type={"file"} onChange={this.onFileChange} className="file-button" accept={".pdf"}
                       id="pdf-button"/>
            </div>
            <p className="s">Only PDF files up to 1MB allowed!</p>
            <div className="pdf">
                <object data={this.state.selectedFile}
                        type="application/pdf"></object>
            </div>
            <div className="button-container">
                <button className="button delete-button"
                        onClick={() => this.props.deleteSelectedComponent()}>Delete component
                </button>
                <button className="button unraised" onClick={() => this.cancel()}>Cancel</button>
                <button className="button" onClick={() => this.uploadPDF()}>Upload</button>
            </div>
        </>
    }
}