import React, { Component } from 'react';
import _ from 'lodash'
import { IoClose } from 'react-icons/io5'
import ModalChooseWizard from './ModalChooseWizard'
import getImageUrl from './GetImageUrl'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalCreateTournament extends Component {
    constructor(props) {
		super(props)

		this.state = {
            idnft: "",
			buyin: 0,
            maxLevel: 0,
            showChooseWizard: false
		}
	}

    onlyNumbers(str) {
		return /^[0-9]+$/.test(str);
	}

    create() {
        const { idnft, buyin, maxLevel } = this.state

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

        this.props.createTournament(idnft, buyin, finalLevel)
    }

	render() {
		const { showModal, onCloseModal, width, wizaBalance } = this.props;
        const { idnft, buyin, maxLevel } = this.state

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        //console.log(account);

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<p style={{ color: 'white', fontSize: 22, textAlign: 'center', marginBottom: 10, marginTop: 10 }}>
						Create Tournament
					</p>

					<div style={styles.boxWallet}>

                        <div style={Object.assign({}, styles.box, { backgroundColor: 'transparent' })}>

                            {
                                idnft ?
                                <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                                    <img
                                        src={getImageUrl(idnft)}
                                        style={{ width: 120, height: 120, borderRadius: 2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', marginBottom: 5 }}
                                    />

                                    <p style={{ fontSize: 17, color: 'white', marginBottom: 10 }}>
                                        #{idnft}
                                    </p>

                                    <button
                                        style={Object.assign({}, styles.btnConnect, { width: 120 })}
                                        className="btnH"
                                        onClick={() => this.setState({ showChooseWizard: true })}
                                    >
                                        <p style={{ fontSize: 16, color: 'white' }}>
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
                                    <p style={{ fontSize: 16, color: 'white' }}>
                                        Choose your Wizard
                                    </p>
                                </button>
                            }


                        </div>

                        <div style={styles.box}>

                            <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                                <p style={{ fontSize: 16, color: 'white' }}>
                                    Buyin
                                </p>

                                <p style={{ fontSize: 16, color: '#c2c0c0' }}>
                                    balance: {_.floor(wizaBalance, 1)} WIZA
                                </p>
                            </div>

                            <input
                                style={styles.input}
                                type='text'
                                placeholder='Enter Buyin'
                                value={this.state.buyin}
                                onChange={(e) => this.setState({ buyin: e.target.value })}
                            />

                        </div>

                        <div style={styles.box}>

                            <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                                <p style={{ fontSize: 16, color: 'white' }}>
                                    MAX Level
                                </p>
                            </div>

                            <input
                                style={styles.input}
                                type='text'
                                placeholder='Enter Max Level'
                                value={this.state.maxLevel}
                                onChange={(e) => this.setState({ maxLevel: e.target.value })}
                            />

                        </div>

                        <button
                            className='btnH'
                            style={Object.assign({}, styles.btnConnect, { marginBottom: 10 })}
                            onClick={() => this.create()}
                        >
                            <p style={{ color: 'white', fontSize: 18 }}>
                                CREATE
                            </p>
                        </button>

                    </div>

					<button
						style={{ position: 'absolute', right: 15, top: 15 }}
						onClick={onCloseModal}
					>
						<IoClose
							color='white'
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
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderStyle: 'solid',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
        padding: 10
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
		height: 40,
		borderWidth: 1,
		borderColor: 'lightgrey',
		borderStyle: 'solid',
		borderRadius: 2,
		fontSize: 15,
		color: 'white',
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
		borderRadius: 2,
	},
    box: {
        flexDirection: 'column',
        backgroundColor: '#1b1930',
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 24,
        paddingRight: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        borderRadius: 2
    }
}

export default ModalCreateTournament
