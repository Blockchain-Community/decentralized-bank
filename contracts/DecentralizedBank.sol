// SPDX-License-Identifier: Non-Licensed
pragma solidity ^0.5.0;

contract DecentralizedBank {
    uint256 public userCount = 0;

    struct User {
        uint256 id;
        string userName;
        address payable userAddress;
        uint256 amount;
    }

    mapping(uint256 => User) public users;

    // Events
    event amountTransferred(
        uint256 id,
        string userName,
        address payable userAddress,
        uint256 amount
    );

    event UserCreated(
        uint256 id,
        string userName,
        address payable userAddress,
        uint256 amount
    );

    // create user
    function createUser(string memory _userName) public {
        require(bytes(_userName).length > 0 && msg.sender != address(0x0), 'Username & Address must not be null.');

        userCount++;

        users[userCount] = User(userCount, _userName, msg.sender, msg.sender.balance);

        emit UserCreated(userCount, _userName, msg.sender, msg.sender.balance);
    }

    // send amount
    function sendAmount(uint256 _id) public payable {
        require(_id > 0 && _id <= userCount, 'The user is not valid.'); // make sure id is valid

        User memory _user = users[_id];

        address payable _userAddress = _user.userAddress;

        address(_userAddress).transfer(msg.value);

        _user.amount += msg.value;

        users[_id] = _user;

        emit amountTransferred(_id, _user.userName, _userAddress, _user.amount);
    }
}
