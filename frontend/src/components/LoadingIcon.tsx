import './LoadingIcon.scss';

export const LoadingIcon = () => {
    return(
        <div className="spinner" data-layer="4">
            <div>
                <div className="spinner-container">
                    <div className="spinner-rotator">
                        <div className="spinner-left">
                            <div className="spinner-circle"></div>
                        </div>
                        <div className="spinner-right">
                            <div className="spinner-circle"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}