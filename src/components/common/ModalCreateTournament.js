import React, { Component } from 'react';
import { connect } from 'react-redux'
import _ from 'lodash'
import { IoClose } from 'react-icons/io5'
import ModalChooseWizard from './ModalChooseWizard'
import getImageUrl from './GetImageUrl'
import '../../css/Modal.css'
import { CTA_COLOR } from '../../actions/types'


class ModalCreateTournament extends Component {
    constructor(props) {
		super(props)

		this.state = {
            idnft: "",
			buyin: 0,
            maxLevel: 0,
            showChooseWizard: false,
            winners: 1,
            name: ""
		}
	}

    onlyNumbers(str) {
		return /^[0-9]+$/.test(str);
	}

    create() {
        const { idnft, buyin, maxLevel, name, winners } = this.state

        //console.log(winners);

        if (!idnft || !buyin || !maxLevel) {
            return
        }

        if (!this.onlyNumbers(buyin)) {
            return
        }

        if (!this.onlyNumbers(maxLevel)) {
            return
        }

        let finalLevel = parseInt(maxLevel) > 350 ? 350 : parseInt(maxLevel)

        this.props.createTournament(idnft, buyin, finalLevel, name, winners)
    }

	render() {
		const { showModal, onCloseModal, width, wizaBalance, mainTextColor, mainBackgroundColor, isDarkmode } = this.props;
        const { idnft } = this.state

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        //console.log(account);

        const height = window.innerHeight
        const maxH = height * 90 / 100

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, backgroundColor: mainBackgroundColor, maxHeight: maxH })}>

					<p style={{ color: mainTextColor, fontSize: 20, textAlign: 'center', marginBottom: 10, marginTop: 10 }} className="text-medium">
						Create Tournament
					</p>

					<div style={styles.boxWallet}>

                        <div style={Object.assign({}, styles.box, { backgroundColor: 'transparent' })}>

                            {
                                idnft ?
                                <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                                    <img
                                        src={getImageUrl(idnft)}
                                        style={{ width: 120, height: 120, borderRadius: 4, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 5 }}
                                        alt="Wizard"
                                    />

                                    <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10 }} className="text-bold">
                                        #{idnft}
                                    </p>

                                    <button
                                        style={Object.assign({}, styles.btnConnect, { width: 120 })}
                                        className="btnH"
                                        onClick={() => this.setState({ showChooseWizard: true })}
                                    >
                                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                            Change
                                        </p>
                                    </button>
                                </div>
                                :
                                <button
                                    style={Object.assign({}, styles.btnConnect, { width: 250 })}
                                    className="btnH"
                                    onClick={() => this.setState({ showChooseWizard: true })}
                                >
                                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                        Choose your Wizard
                                    </p>
                                </button>
                            }


                        </div>

                        <div style={Object.assign({}, styles.box, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}>

                            <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                                <p style={{ fontSize: 16, color: mainTextColor }}>
                                    Flash Tournament Name
                                </p>
                            </div>

                            <input
                                style={Object.assign({}, styles.input, { color: mainTextColor })}
                                type='text'
                                placeholder='Enter a Name (optional)'
                                value={this.state.name}
                                onChange={(e) => this.setState({ name: e.target.value })}
                            />

                        </div>

                        <div style={Object.assign({}, styles.box, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}>

                            <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                                <p style={{ fontSize: 16, color: mainTextColor }}>
                                    Buyin
                                </p>

                                <p style={{ fontSize: 13, color: mainTextColor }}>
                                    balance: {_.floor(wizaBalance, 1)} $WIZA
                                </p>
                            </div>

                            <input
                                style={Object.assign({}, styles.input, { color: mainTextColor })}
                                type='text'
                                placeholder='Enter Buyin'
                                value={this.state.buyin}
                                onChange={(e) => this.setState({ buyin: e.target.value })}
                            />

                        </div>

                        <div style={Object.assign({}, styles.box, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}>

                            <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                                <p style={{ fontSize: 16, color: mainTextColor }}>
                                    Max level
                                </p>
                            </div>

                            <input
                                style={Object.assign({}, styles.input, { color: mainTextColor })}
                                type='text'
                                placeholder='Enter Max Level'
                                value={this.state.maxLevel}
                                onChange={(e) => this.setState({ maxLevel: e.target.value })}
                            />

                        </div>

                        <div style={Object.assign({}, styles.box, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}>

                            <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                                <p style={{ fontSize: 16, color: mainTextColor }}>
                                    Prizes
                                </p>
                            </div>

                            <div style={{ alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: 10 }}>
                                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                                    <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center' }}>
                                        Winner takes all
                                    </p>

                                    <input
                                        //style={styles.input}
                                        type='radio'
                                        value={1}
                                        checked={this.state.winners === 1}
                                        onChange={(e) => this.setState({ winners: 1 })}
                                    />
                                </div>

                                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                                    <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center' }}>
                                        70% 1st, 30% 2nd
                                    </p>

                                    <input
                                        //style={styles.input}
                                        type='radio'
                                        value={2}
                                        checked={this.state.winners === 2}
                                        onChange={(e) => this.setState({ winners: 2 })}
                                    />
                                </div>
                            </div>

                        </div>

                        <button
                            className='btnH'
                            style={Object.assign({}, styles.btnConnect, { marginBottom: 10 })}
                            onClick={() => this.create()}
                        >
                            <p style={{ color: 'white', fontSize: 15 }} className="text-medium">
                                Create
                            </p>
                        </button>

                    </div>

					<button
						style={{ position: 'absolute', right: 15, top: 15 }}
						onClick={onCloseModal}
					>
						<IoClose
							color={mainTextColor}
							size={25}
						/>
					</button>
				</div>

                <ModalChooseWizard
                    showModal={this.state.showChooseWizard}
                    onCloseModal={() => this.setState({ showChooseWizard: false })}
                    equipment={this.props.equipment}
                    yourWizards={this.props.yourWizards}
                    onSelect={(id) => {
                        this.setState({ idnft: id, showChooseWizard: false })
                    }}
                />
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
        padding: 10,
        overflowY: 'auto',
        overflowX: 'hidden'
	},
    boxWallet: {
		flexDirection: 'column',
		backgroundColor: 'transparent',
		paddingLeft: 12,
		paddingRight: 12,
		alignItems: 'center',
        width: '70%'
	},
	input: {
		width: '100%',
		height: 30,
		borderWidth: 1,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderRadius: 4,
		fontSize: 15,
		color: 'black',
        fontFamily: 'FigtreeMedium',
		paddingLeft: 8,
		paddingRight: 8,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		outline: 'none',
        backgroundColor: 'transparent',
        marginBottom: 10
	},
	btnConnect: {
		width: 200,
		height: 40,
		backgroundColor: CTA_COLOR,
		borderRadius: 4,
	},
    box: {
        flexDirection: 'column',
        backgroundColor: '#f2f2f2',
        paddingTop: 8,
        paddingBottom: 2,
        paddingLeft: 24,
        paddingRight: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
        borderRadius: 4
    }
}

const mapStateToProps = (state) => {
    const { mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer

    return { mainTextColor, mainBackgroundColor, isDarkmode }
}

export default connect(mapStateToProps)(ModalCreateTournament)
