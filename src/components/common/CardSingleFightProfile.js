import React, { Component } from 'react'
import getImageUrl from './GetImageUrl'
import { TEXT_SECONDARY_COLOR, CTA_COLOR } from '../../actions/types'

class CardSingleFightProfile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showResult: false
        }
    }

    render() {
        const { userMintedNfts, item, index } = this.props

		const itemInfo = userMintedNfts.find(i => i.name === item.name)

		const isWinner = item.winner === itemInfo.id

		return (
            <div
                style={styles.boxSingleFight}
				key={index}
            >
				<img
					src={getImageUrl(itemInfo.id)}
					style={{ width: 140, height: 140, borderRadius: 2, marginRight: 15, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
					alt={itemInfo.name}
				/>

				<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginRight: 10 }}>
					<p style={{ color: 'white', fontSize: 17, marginBottom: 4 }}>
						{item.name}
					</p>

					{
                        this.state.showResult &&
                        <div style={{ flexDirection: 'column' }}>

                            <div style={{ height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                                <p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 22, textAlign: 'center' }}>
                                    {isWinner ? "WINNER" : "LOSER"}
                                </p>
                            </div>

                            <a
                                href={`${window.location.protocol}//${window.location.host}/fight/${item.fightId}`}
                                style={styles.btnChoice}
                                className="btnH"
                                onClick={(e) => {
                                    this.preventDefault()
                                    this.props.history.push(`/fight/${item.fightId}`)
                                }}
                            >
                                <p style={{ color: 'white', fontSize: 17 }}>
            						REPLAY
            					</p>
                            </a>
                        </div>
                    }

                    {
                        !this.state.showResult &&
                        <div style={{ flexDirection: 'column' }}>
                            <button
                                className="btnH"
                                style={Object.assign({}, styles.btnChoice, { marginBottom: 12 })}
                                onClick={() => this.setState({ showResult: true })}
                            >
                                <p style={{ color: 'white', fontSize: 17 }}>
            						SHOW RESULT
            					</p>
                            </button>

                            <a
                                href={`${window.location.protocol}//${window.location.host}/fight/${item.fightId}`}
                                style={styles.btnChoice}
                                className="btnH"
                                onClick={(e) => {
                                    this.preventDefault()
                                    this.props.history.push(`/fight/${item.fightId}`)
                                }}
                            >
                                <p style={{ color: 'white', fontSize: 17 }}>
            						REPLAY
            					</p>
                            </a>
                        </div>
                    }
				</div>
            </div>
		)
    }
}

const styles = {
    boxSingleFight: {
		backgroundColor: '#ffffff15',
		borderRadius: 2,
		alignItems: 'center',
		width: 275,
		height: 170,
		display: 'flex',
		justifyContent: 'flex-start',
		paddingLeft: 15,
		marginRight: 20,
		marginBottom: 20
	},
    btnChoice: {
        width: 100,
        height: 40,
        borderRadius: 2,
        backgroundColor: CTA_COLOR,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
}

export default CardSingleFightProfile
