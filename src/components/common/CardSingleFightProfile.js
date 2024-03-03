import React, { Component } from 'react'
import { connect } from 'react-redux'
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
        const { userMintedNfts, item, index, mainTextColor } = this.props

		const itemInfo = userMintedNfts.find(i => i.name === item.name)

		const isWinner = item.winner === itemInfo.id

		return (
            <div
                style={styles.boxSingleFight}
				key={index}
            >
				<img
					src={getImageUrl(itemInfo.id)}
					style={{ width: 110, height: 110, borderRadius: 4, marginRight: 15, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid' }}
					alt={itemInfo.name}
				/>

				<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginRight: 10 }}>
					<p style={{ color: mainTextColor, fontSize: 16, marginBottom: 4 }} className="text-medium">
						{item.name}
					</p>

					{
                        this.state.showResult &&
                        <div style={{ flexDirection: 'column' }}>

                            <div style={{ height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                                <p style={{ color: isWinner ? TEXT_SECONDARY_COLOR : '#707070', fontSize: 17, textAlign: 'center' }} className="text-bold">
                                    {isWinner ? "Winner" : "Loser"}
                                </p>
                            </div>

                            <a
                                href={`${window.location.protocol}//${window.location.host}/fightreplay/fights/${item.fightId}`}
                                style={styles.btnChoice}
                                className="btnH"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <p style={{ color: 'white', fontSize: 15 }} className="text-medium">
            						Replay
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
                                <p style={{ color: "white", fontSize: 15 }} className="text-medium">
            						Show result
            					</p>
                            </button>

                            <a
                                href={`${window.location.protocol}//${window.location.host}/fightreplay/fights/${item.fightId}`}
                                style={styles.btnChoice}
                                className="btnH"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <p style={{ color: 'white', fontSize: 15 }} className="text-medium">
            						Replay
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
        borderColor: "#d7d7d7",
		borderRadius: 4,
        borderStyle: 'solid',
        borderWidth: 1,
		alignItems: 'center',
		width: 235,
		height: 150,
		display: 'flex',
		justifyContent: 'flex-start',
		paddingLeft: 10,
		marginRight: 20,
		marginBottom: 20
	},
    btnChoice: {
        width: 100,
        height: 36,
        borderRadius: 4,
        backgroundColor: CTA_COLOR,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
}

const mapStateToProps = (state) => {
    const { mainTextColor } = state.mainReducer

    return { mainTextColor }
}

export default connect(mapStateToProps)(CardSingleFightProfile)
