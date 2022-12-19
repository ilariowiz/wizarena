import React, { Component } from 'react';
import moment from 'moment'
import { IoClose } from 'react-icons/io5'
import { AiOutlineCheck } from 'react-icons/ai'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR } from '../../actions/types'
import '../../css/Nft.css'


class ModalMakeOffer extends Component {
	constructor(props) {
		super(props)

		this.state = {
			inputOffer: '',
			duration: '',
			loading: false,
			acceptCondition: false,
			error: ''
		}
	}

	// azzeriamo lo state quando il popup viene mostrato,
	// in modo da non avere i campi compilati dalla precendente offerta
	componentDidUpdate(prevProps, prevState) {
		if (this.props.showModal && prevProps.showModal !== this.props.showModal) {
			//console.log("show modal")
			this.setState({ inputOffer: '', duration: '', acceptCondition: false, error: '', loading: false })
		}
	}

	onlyNumbers(str) {
		return /^[0-9]+$/.test(str);
	}

	submitOffer() {
		const { inputOffer, duration, acceptCondition } = this.state;

		if (!this.onlyNumbers(inputOffer)) {
			this.setState({ error: 'Please enter valid amount' })
			return
		}

		if (!this.onlyNumbers(duration)) {
			this.setState({ error: 'Please enter valid duration' })
			return
		}

		if (!acceptCondition) {
			this.setState({ error: 'Please check "I understand the conditions for making an offer"' })
			return
		}

		this.props.submitOffer(inputOffer, duration)
	}

	render() {
		const { showModal, onCloseModal, width } = this.props;
		const { inputOffer, duration, acceptCondition, error } = this.state

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		const pW = width * 80 / 100

		//console.log(moment().add(duration, 'days').format("dddd, MMMM Do YYYY, h:mm:ss a"))

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<p style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>
						Make an offer
					</p>

					<input
						style={styles.input}
						type='text'
						placeholder='Offer amount KDA'
						value={inputOffer}
						onChange={(e) => this.setState({ inputOffer: e.target.value })}
					/>

					{
						inputOffer.length > 0 && !this.onlyNumbers(inputOffer) ?
						<p style={{ fontSize: 13, color: 'red', marginBottom: 10 }}>
							Please enter a valid amount
						</p>
						: null
					}

					<input
						style={Object.assign({}, styles.input, { marginBottom: 20 })}
						type='text'
						placeholder='Offer expiration (in days)'
						value={duration}
						onChange={(e) => this.setState({ duration: e.target.value })}
					/>

					{
						duration.length > 0 && !this.onlyNumbers(duration) ?
						<p style={{ fontSize: 13, color: 'red', marginBottom: 10 }}>
							Please enter a valid duration
						</p>
						: null
					}

					<p style={{ fontSize: 19, color: 'white' ,marginBottom: 5 }}>
						Offer: {inputOffer || '__'} KDA, expire in {duration || '__'} days
					</p>

                    {
						duration.length > 0 && this.onlyNumbers(duration) ?
						<p style={{ fontSize: 15, color: TEXT_SECONDARY_COLOR, marginBottom: 20 }}>
							({moment().add(duration, 'days').format("dddd, MMMM Do YYYY, h:mm:ss a")})
						</p>
						: null
					}

					<p style={{ fontSize: 20, color: 'white', textAlign: 'center', marginBottom: 10 }}>
						IMPORTANT
					</p>

					<p style={{ fontSize: 16, color: 'white', width: pW, textAlign: 'center', lineHeight: 1.5 }}>
						When you submit an offer, the amount of the offer will be withdrawn from your wallet and deposited in the contract. This amount can be only withdrawn by you in your profile if the offer expires, or by the owner of the NFT if he accepts the offer before the expiration date.
					</p>

					<div style={{ justifyContent: 'center', alignItems: 'center', width: '80%', marginTop: 20, marginBottom: 15 }}>
						<button
							style={{ width: 35, height: 30, maxWidth: 35, backgroundColor: 'white', borderWidth: 1, borderColor: CTA_COLOR, borderStyle: 'solid' }}
							onClick={() => this.setState({ acceptCondition: !this.state.acceptCondition, error: '' })}
						>
							{
								acceptCondition &&
								<AiOutlineCheck
									color={CTA_COLOR}
									size={23}
								/>
							}
						</button>

						<p style={{ fontSize: 16, color: 'white', marginLeft: 10 }}>
							I understand the conditions for making an offer
						</p>
					</div>

					{
						error &&
						<p style={{ fontSize: 16, color: 'red', marginBottom: 10, width: '80%', textAlign: 'center' }}>
							{error}
						</p>
					}

					<button
						className='btnH'
						style={styles.btnStyle}
						onClick={() => this.submitOffer()}
					>
						<p style={{ fontSize: 18, color: 'white' }}>
							Submit offer
						</p>
					</button>

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
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		paddingTop: 15,
		paddingBottom: 15,
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderStyle: 'solid',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative'
	},
	input: {
		width: 260,
		height: 45,
		borderWidth: 1,
		borderColor: '#ededed',
		borderStyle: 'solid',
		borderRadius: 2,
		fontSize: 17,
		color: 'black',
		paddingLeft: 16,
		paddingRight: 16,
		marginBottom: 10,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		fontWeight: '500',
		outline: 'none'
	},
	btnStyle: {
		width: 295,
		height: 45,
		borderRadius: 2,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10
	}
}

export default ModalMakeOffer;
