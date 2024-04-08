import React, { Component } from 'react';
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import getImageUrl from './GetImageUrl'
import '../../css/Modal.css'
import { CTA_COLOR } from '../../actions/types'


class ModalFightConquest extends Component {
	render() {
		const { showModal, width, mainTextColor, mainBackgroundColor, infoFight, isMobile, isFightDone } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        const imgSize = isMobile ? (width - 70) / 2 : 200

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, backgroundColor: mainBackgroundColor })}>

                    <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}>

                        <img
                            style={{ width: imgSize, height: imgSize, borderRadius: 4 }}
                            src={getImageUrl(infoFight.nft1.id)}
                            alt={`#${infoFight.nft1.id}`}
                        />

                        <p style={{ fontSize: 18, color: mainTextColor, textAlign: 'center', marginRight: 10, marginLeft: 10 }} className="text-bold">
                            VS
                        </p>

						{
							infoFight.nft2 && infoFight.nft2.id ?
							<img
	                            style={{ width: imgSize, height: imgSize, borderRadius: 4 }}
	                            src={getImageUrl(infoFight.nft2.id)}
	                            alt={`#${infoFight.nft2.id}`}
	                        />
							:
							<img
	                            style={{ width: imgSize, height: imgSize, borderRadius: 4 }}
	                            src={getImageUrl(undefined)}
								alt="placeholder"
	                        />
						}


                    </div>

                    {
                        infoFight.evento ?
                        <p style={{ fontSize: 16, color: mainTextColor, margin: 15 }}>
                            Event <span style={{ color: CTA_COLOR }}>{infoFight.evento.name}</span>, element boosted <span style={{ color: CTA_COLOR }}>{infoFight.evento.elements.toUpperCase()}</span>
                        </p>
                        :
                        <div style={{ width: 15, height: 15 }} />
                    }


                    {
                        !isFightDone ?
                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <DotLoader size={25} color={CTA_COLOR} />

                            <p style={{ color: mainTextColor, fontSize: 16, margin: 10 }}>
                                Loading fight...
                            </p>
                        </div>
                        :
                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: mainTextColor, fontSize: 16, margin: 10 }}>
                                The winner is:
                            </p>

                            <p style={{ color: CTA_COLOR, fontSize: 18, marginBottom: 10 }} className="text-bold">
                                #{infoFight.winner}
                            </p>

                            <button
                                style={styles.btnDone}
                                onClick={() => this.props.closeModal()}
                            >
                                <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                                    Close
                                </p>
                            </button>
                        </div>
                    }


				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		minHeight: 300,
        minWidth: 250,
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative'
	},
    btnDone: {
        width: 130,
		height: 36,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
        display: 'flex',
        cursor: 'pointer',
        marginBottom: 15
	}
}

const mapStateToProps = (state) => {
	const { mainTextColor, mainBackgroundColor } = state.mainReducer

	return { mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps)(ModalFightConquest);
