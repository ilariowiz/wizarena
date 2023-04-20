import React, { Component } from 'react';
import getImageUrl from './GetImageUrl'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalFightsFlashTournament extends Component {

	renderFight(item, index) {

		const imgWidth = 60

		return (
			<a
				key={index}
				href={`${window.location.protocol}//${window.location.host}/fight/${item.fightId}`}
				style={styles.boxFight}
				onClick={(e) => {
					e.preventDefault()
					this.props.history.push(`/fight/${item.fightId}`)
				}}
			>
				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s1)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s1}
					/>

					<p style={{ fontSize: 15, color: 'white', textAlign: 'center' }}>
						#{item.s1}
					</p>
				</div>

				<p style={{ fontSize: 14, color: 'white', marginRight: 8, marginLeft: 8 }}>
					VS
				</p>

				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s2)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s2}
					/>
					<p style={{ fontSize: 15, color: 'white', textAlign: 'center' }}>
						#{item.s2}
					</p>
				</div>
			</a>
		)
	}

	render() {
		const { showModal, width, fights, tournamentid } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		if (!tournamentid) {
			return <div />
		}

		//let rounds = fights ? Object.keys(fights) : undefined
		//console.log(fights);
		//console.log(fights[`${tournamentid}_r1`]);

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width: '80%' })}>


					<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: 25 }}>
						{
							fights && fights[`${tournamentid}_r1`].map((item, index) => {
								return this.renderFight(item, index)
							})
						}
					</div>

					<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: 15 }}>
						{
							fights && fights[`${tournamentid}_r2`].map((item, index) => {
								return this.renderFight(item, index)
							})
						}
					</div>

					<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: 25 }}>
						{
							fights && fights[`${tournamentid}_r3`].map((item, index) => {
								return this.renderFight(item, index)
							})
						}
					</div>

					<a
						href={`${window.location.protocol}//${window.location.host}/nft/${fights.winner}`}
						style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
						onClick={(e) => {
							e.preventDefault()
							this.props.history.push(`/nft/${fights.winner}`)
						}}
					>
						<img
							src={getImageUrl(fights.winner)}
							style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', marginBottom: 4 }}
							alt={fights.winner}
						/>

						<p style={{ fontSize: 16, color: 'white', marginBottom: 20 }}>
							#{fights.winner}
						</p>
					</a>

                    <button
                        className='btnH'
                        style={styles.btnConnect}
                        onClick={() => this.props.onCloseModal()}
                    >
                        <p style={{ color: 'white', fontSize: 16 }}>
                            Close
                        </p>
                    </button>

				</div>
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
		paddingTop: 20,
		paddingBottom: 20
	},
	btnConnect: {
		width: 120,
		height: 35,
		backgroundColor: CTA_COLOR,
		borderRadius: 2,
	},
	boxFight: {
		cursor: 'pointer',
		padding: 5,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		display: 'flex',
		backgroundColor: '#ffffff10',
		borderRadius: 2
	}
}

export default ModalFightsFlashTournament;
