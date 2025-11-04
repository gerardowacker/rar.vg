import React from 'react';
import Button from './button';

export default class PDFExportDialog extends React.Component {
    constructor(props) {
        super(props);
        this.dialogRef = React.createRef();
    }

    componentDidUpdate(prevProps) {
        if (this.props.isOpen !== prevProps.isOpen) {
            if (this.props.isOpen) {
                this.dialogRef.current?.showModal();
            } else {
                this.dialogRef.current?.close();
            }
        }
    }

    handleBackdropClick = (event) => {
        // Close dialog when clicking on backdrop
        if (event.target === this.dialogRef.current) {
            this.props.onCancel();
        }
    }

    handleKeyDown = (event) => {
        // Close dialog on Escape key
        if (event.key === 'Escape') {
            this.props.onCancel();
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    render() {
        const { username, onConfirm, onCancel } = this.props;

        return (
            <dialog 
                className="pdf-export-modal" 
                ref={this.dialogRef}
                onClick={this.handleBackdropClick}
            >
                <div onClick={e => e.stopPropagation()}>
                    <div className="question-pdf-export">
                        <span className="m">Save your profile as PDF?</span>
                        <span className="s pdf-filename-preview">
                            File will be saved as: <strong>{username}.pdf</strong>
                        </span>
                    </div>
                    <div className="pdf-export-modal-buttons-container">
                        <Button 
                            className="pdf-export-modal-button cancel" 
                            variant="gray"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="pdf-export-modal-button done" 
                            variant="primary"
                            onClick={onConfirm}
                        >
                            Save PDF
                        </Button>
                    </div>
                </div>
            </dialog>
        );
    }
}