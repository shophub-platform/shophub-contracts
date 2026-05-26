// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// OpenZeppelin je kao Spring Security/Data za Solidity -
// proverene, audited implementacije standardnih ugovora
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Lažni USDT token za testiranje na Sepolia testnetu.
 *
 * ERC20 je standard za fungibilne tokene na Ethereumu - definiše
 * funkcije kao što su transfer(), balanceOf(), approve() itd.
 * Kao što Java ima interfejse, Ethereum ima standarde (EIP).
 *
 * Ownable znači da kontrakt ima "vlasnika" (adresu koja ga je deploy-ovala)
 * koji ima posebne privilegije - slično kao PreAuthorize ADMIN role u Spring-u.
 */
contract MockUSDT is ERC20, Ownable {
    // Broj decimalnih mesta. Pravi USDT ima 6, ali koristimo 18
    // jer je to ERC20 standard i lakše je za testiranje.
    uint8 private constant DECIMALS = 18;

    // Početna količina tokena koji se mint-uju deploy-eru (1,000,000 USDT)
    uint256 private constant INITIAL_SUPPLY = 1_000_000 * 10 ** DECIMALS;

    /**
     * @dev Konstruktor - poziva se jednom pri deploy-u, kao @PostConstruct u Spring-u.
     * Poziva ERC20 konstruktor sa imenom i simbolom tokena.
     * Poziva Ownable konstruktor sa adresom vlasnika (msg.sender = onaj ko deploy-uje).
     */
    constructor() ERC20("Mock USDT", "mUSDT") Ownable(msg.sender) {
        // Mint-uj početnu količinu tokena deploy-eru
        // _mint je interna OpenZeppelin funkcija
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint funkcija - kreira nove tokene.
     * Samo vlasnik kontrakta može da mint-uje (onlyOwner modifier).
     * Koristimo za testiranje - možemo sebi da damo koliko hoćemo tokena.
     *
     * @param to     Adresa koja prima tokene
     * @param amount Količina tokena (u wei, dakle množiti sa 10^18)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Override decimals() funkcije iz ERC20.
     * Vraća broj decimala tokena.
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @dev Helper funkcija za testiranje - mint-uje 1000 mUSDT pozivaču.
     * Kao "faucet" - svako može da dobije test tokene.
     * NE koristiti u produkciji!
     */
    function faucet() external {
        uint256 amount = 1_000 * 10 ** DECIMALS;
        _mint(msg.sender, amount);
    }
}
